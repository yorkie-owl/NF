import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { DataSource, IsNull, Repository } from 'typeorm';
import {
  USER_EVENTS,
  type AuthResponse,
  type AuthTokens,
  type JwtPayload,
  type LoginRequest,
  type RefreshRequest,
  type RegisterRequest,
  type UserRegisteredEvent,
} from '@lin-shi/contracts';
import { UserEntity } from '../users/entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { UsersService } from '../users/users.service';
import { InviteCodesService } from '../invite-codes/invite-codes.service';
import type { Env } from '../config/env.schema';

// argon2id recommended defaults (https://github.com/ranisalt/node-argon2).
const ARGON2_OPTIONS: argon2.Options = { type: argon2.argon2id };

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokens: Repository<RefreshTokenEntity>,
    private readonly dataSource: DataSource,
    private readonly jwt: JwtService,
    private readonly users: UsersService,
    private readonly inviteCodes: InviteCodesService,
    private readonly config: ConfigService<Env, true>,
    private readonly events: EventEmitter2,
  ) {}

  async register(req: RegisterRequest): Promise<AuthResponse> {
    const email = req.email.toLowerCase();

    const user = await this.dataSource.transaction(async (manager) => {
      // 1. Email availability (inside the transaction for a consistent view).
      const existing = await manager
        .getRepository(UserEntity)
        .findOne({ where: { email } });
      if (existing) {
        throw new ConflictException({
          code: 'AUTH_EMAIL_TAKEN',
          message: '邮箱已被注册',
        });
      }

      // 2. Hash password and create user.
      const passwordHash = await argon2.hash(req.password, ARGON2_OPTIONS);
      const usersRepo = manager.getRepository(UserEntity);
      const created = await usersRepo.save(
        usersRepo.create({
          email,
          passwordHash,
          nickname: req.nickname,
          lastLoginAt: new Date(),
        }),
      );

      // 3. CAS-consume the invite code (throws INVITE_INVALID/CONSUMED on failure).
      await this.inviteCodes.consumeForRegistration(
        manager,
        req.inviteCode,
        created.id,
      );

      // 4. Issue the new user's own invite code.
      await this.inviteCodes.issueForUser(created.id, manager);

      return created;
    });

    // 5. Sign tokens + persist refresh hash (outside the register transaction
    //    to avoid holding it while we hash).
    const tokens = await this.issueTokens(user);

    // 6. Emit user.registered so F can seed the initial credit score, etc.
    this.events.emit(USER_EVENTS.REGISTERED, {
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
      registeredAt: new Date().toISOString(),
    } satisfies UserRegisteredEvent);

    const userPrivate = await this.users.toUserPrivate(user);
    return { tokens, user: userPrivate };
  }

  async login(req: LoginRequest): Promise<AuthResponse> {
    const email = req.email.toLowerCase();
    const user = await this.users.findByEmailNormalized(email);
    if (!user) {
      throw invalidCredentials();
    }
    const ok = await argon2.verify(user.passwordHash, req.password);
    if (!ok) {
      throw invalidCredentials();
    }

    await this.users.markLoggedIn(user.id);
    const tokens = await this.issueTokens(user);
    // Reload to pick up fresh lastLoginAt.
    const reloaded = await this.users.findById(user.id);
    const userPrivate = await this.users.toUserPrivate(reloaded);
    return { tokens, user: userPrivate };
  }

  async refresh(req: RefreshRequest): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(req.refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_INVALID',
        message: 'Refresh token 无效',
      });
    }

    const candidates = await this.refreshTokens.find({
      where: { userId: payload.sub, revokedAt: IsNull() },
    });

    const now = new Date();
    let matched: RefreshTokenEntity | null = null;
    for (const row of candidates) {
      if (row.expiresAt.getTime() <= now.getTime()) continue;
      const ok = await argon2.verify(row.tokenHash, req.refreshToken);
      if (ok) {
        matched = row;
        break;
      }
    }
    if (!matched) {
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_REVOKED',
        message: 'Refresh token 已失效',
      });
    }

    // Rotate: revoke the old row before issuing a new pair.
    matched.revokedAt = now;
    await this.refreshTokens.save(matched);

    const user = await this.users.findById(payload.sub);
    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokens.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private async issueTokens(user: UserEntity): Promise<AuthTokens> {
    const accessTtl = this.config.getOrThrow<string>('JWT_ACCESS_TTL');
    const refreshTtl = this.config.getOrThrow<string>('JWT_REFRESH_TTL');

    const basePayload = { sub: user.id, email: user.email };

    const accessToken = await this.jwt.signAsync(basePayload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessTtl,
    });
    const refreshToken = await this.jwt.signAsync(
      { ...basePayload, jti: randomBytes(16).toString('hex') },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl,
      },
    );

    const decodedAccess = this.jwt.decode(accessToken) as {
      exp?: number;
    } | null;
    const decodedRefresh = this.jwt.decode(refreshToken) as {
      exp?: number;
    } | null;
    if (!decodedAccess?.exp || !decodedRefresh?.exp) {
      throw new Error('Failed to decode JWT exp claim');
    }

    // Store the refresh token hash only.
    const tokenHash = await argon2.hash(refreshToken, ARGON2_OPTIONS);
    await this.refreshTokens.save(
      this.refreshTokens.create({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(decodedRefresh.exp * 1000),
      }),
    );

    return {
      accessToken,
      refreshToken,
      accessExpiresAt: new Date(decodedAccess.exp * 1000).toISOString(),
      refreshExpiresAt: new Date(decodedRefresh.exp * 1000).toISOString(),
    };
  }
}

function invalidCredentials(): UnauthorizedException {
  return new UnauthorizedException({
    code: 'AUTH_INVALID_CREDENTIALS',
    message: '邮箱或密码错误',
  });
}
