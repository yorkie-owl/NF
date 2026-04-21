import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import type {
  InviteCodeDetail,
  UpdateProfileRequest,
  UserPrivate,
  UserPublic,
} from '@lin-shi/contracts';
import { UserEntity } from './entities/user.entity';
import { UserBadgeEntity } from '../badges/entities/user-badge.entity';
import { FriendPreferencesEntity } from '../preferences/entities/friend-preferences.entity';
import { FoodPreferencesEntity } from '../preferences/entities/food-preferences.entity';
import { InviteCodesService } from '../invite-codes/invite-codes.service';
import {
  CREDIT_CLIENT,
  type CreditClient,
} from '../external/credit.client';
import type { Env } from '../config/env.schema';

export interface AvatarUpload {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

const ALLOWED_AVATAR_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(UserBadgeEntity)
    private readonly userBadges: Repository<UserBadgeEntity>,
    @InjectRepository(FriendPreferencesEntity)
    private readonly friendPrefs: Repository<FriendPreferencesEntity>,
    @InjectRepository(FoodPreferencesEntity)
    private readonly foodPrefs: Repository<FoodPreferencesEntity>,
    private readonly inviteCodes: InviteCodesService,
    @Inject(CREDIT_CLIENT) private readonly credit: CreditClient,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '用户不存在',
      });
    }
    return user;
  }

  async getMe(userId: string): Promise<UserPrivate> {
    const user = await this.findById(userId);

    // Ensure preferences rows exist (lazy getOrCreate).
    await this.ensureFriendPreferences(userId);
    await this.ensureFoodPreferences(userId);

    const [badgeCodes, creditResult] = await Promise.all([
      this.loadBadgeCodes(userId),
      this.credit.getUserCredit(userId).catch((): null => null),
    ]);

    return toUserPrivate(user, badgeCodes, creditResult?.score ?? null);
  }

  async getPublicUser(id: string): Promise<UserPublic> {
    const user = await this.findById(id);
    const badgeCodes = await this.loadBadgeCodes(id);
    return toUserPublic(user, badgeCodes);
  }

  async updateProfile(
    userId: string,
    patch: UpdateProfileRequest,
  ): Promise<UserPrivate> {
    const user = await this.findById(userId);

    // Explicit updates: null clears the field; undefined leaves it untouched.
    if (patch.nickname !== undefined) user.nickname = patch.nickname;
    if (patch.avatarUrl !== undefined) user.avatarUrl = patch.avatarUrl;
    if (patch.school !== undefined) user.school = patch.school;
    if (patch.city !== undefined) user.city = patch.city;
    if (patch.bio !== undefined) user.bio = patch.bio;

    await this.users.save(user);
    return this.getMe(userId);
  }

  async uploadAvatar(
    userId: string,
    file: AvatarUpload,
  ): Promise<{ avatarUrl: string }> {
    if (file.size > MAX_AVATAR_BYTES) {
      throw new BadRequestException({
        code: 'USER_AVATAR_TOO_LARGE',
        message: '头像图片不能超过 2MB',
      });
    }
    if (!ALLOWED_AVATAR_MIME.has(file.mimetype)) {
      throw new BadRequestException({
        code: 'USER_AVATAR_BAD_FORMAT',
        message: '仅支持 JPEG / PNG / WebP 格式',
      });
    }

    const ext = mimeToExtension(file.mimetype);
    const filename = `${randomUUID()}.${ext}`;
    const dir = path.resolve(
      process.cwd(),
      this.config.getOrThrow<string>('UPLOADS_DIR'),
      'avatars',
    );
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), file.buffer);

    const publicBase = this.config
      .getOrThrow<string>('UPLOADS_PUBLIC_URL')
      .replace(/\/+$/, '');
    const avatarUrl = `${publicBase}/avatars/${filename}`;

    const user = await this.findById(userId);
    user.avatarUrl = avatarUrl;
    await this.users.save(user);

    return { avatarUrl };
  }

  async findByEmailNormalized(email: string): Promise<UserEntity | null> {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.findByEmailNormalized(email);
    if (existing) {
      throw new ConflictException({
        code: 'AUTH_EMAIL_TAKEN',
        message: '邮箱已被注册',
      });
    }
  }

  async markLoggedIn(userId: string): Promise<void> {
    await this.users.update({ id: userId }, { lastLoginAt: new Date() });
  }

  async toUserPrivate(user: UserEntity): Promise<UserPrivate> {
    const [badgeCodes, creditResult] = await Promise.all([
      this.loadBadgeCodes(user.id),
      this.credit.getUserCredit(user.id).catch((): null => null),
    ]);
    return toUserPrivate(user, badgeCodes, creditResult?.score ?? null);
  }

  private async loadBadgeCodes(userId: string): Promise<string[]> {
    const rows = await this.userBadges.find({ where: { userId } });
    return rows.map((row) => row.badgeCode);
  }

  private async ensureFriendPreferences(userId: string): Promise<void> {
    const row = await this.friendPrefs.findOne({ where: { userId } });
    if (row) return;
    await this.friendPrefs.save(
      this.friendPrefs.create({
        userId,
        acceptStrangers: false,
        distanceKm: 5,
        timeSlots: [],
      }),
    );
  }

  private async ensureFoodPreferences(userId: string): Promise<void> {
    const row = await this.foodPrefs.findOne({ where: { userId } });
    if (row) return;
    await this.foodPrefs.save(
      this.foodPrefs.create({
        userId,
        cuisines: [],
        dietaryRestrictions: [],
        cookingSkill: 'BEGINNER',
      }),
    );
  }

  /** Utility used by auth.service to assemble the register response. */
  async getInviteCodeDetail(userId: string): Promise<InviteCodeDetail> {
    return this.inviteCodes.getMyCodeDetail(userId);
  }
}

function toUserPrivate(
  user: UserEntity,
  badges: string[],
  credit: number | null,
): UserPrivate {
  return {
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl ?? null,
    school: user.school ?? null,
    city: user.city ?? null,
    bio: user.bio ?? null,
    badges,
    email: user.email,
    credit,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
  };
}

function toUserPublic(user: UserEntity, badges: string[]): UserPublic {
  return {
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl ?? null,
    school: user.school ?? null,
    city: user.city ?? null,
    bio: user.bio ?? null,
    badges,
  };
}

function mimeToExtension(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      throw new Error(`Unexpected mime type: ${mime}`);
  }
}
