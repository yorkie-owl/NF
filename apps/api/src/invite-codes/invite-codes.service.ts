import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'node:crypto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import type {
  InviteCodeDetail,
  InviteCodeRedemption,
} from '@lin-shi/contracts';
import { InviteCodeEntity } from './entities/invite-code.entity';
import { InviteRedemptionEntity } from './entities/invite-redemption.entity';
import { UserEntity } from '../users/entities/user.entity';

// Crockford Base32 alphabet with I/L/O/U removed to avoid ambiguity.
const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CODE_PREFIX = 'LINSH-';
const CODE_SUFFIX_LEN = 4;
const MAX_CODE_RETRIES = 5;
const DEFAULT_MAX_USES = 3;

@Injectable()
export class InviteCodesService {
  constructor(
    @InjectRepository(InviteCodeEntity)
    private readonly codes: Repository<InviteCodeEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Issue a brand-new invite code owned by `userId`. Retries on UNIQUE conflict
   * up to MAX_CODE_RETRIES (Crockford 32^4 = ~1M combos so collision is rare).
   * Runs inside the caller's EntityManager if supplied, so it can participate
   * in the registration transaction.
   */
  async issueForUser(
    userId: string,
    manager?: EntityManager,
  ): Promise<InviteCodeEntity> {
    const repo = manager
      ? manager.getRepository(InviteCodeEntity)
      : this.codes;

    let lastErr: unknown = null;
    for (let attempt = 0; attempt < MAX_CODE_RETRIES; attempt += 1) {
      const code = generateCode();
      const entity = repo.create({
        ownerId: userId,
        code,
        maxUses: DEFAULT_MAX_USES,
        usesRemaining: DEFAULT_MAX_USES,
      });
      try {
        return await repo.save(entity);
      } catch (err: unknown) {
        lastErr = err;
        // Retry on unique violation; rethrow otherwise.
        if (!isUniqueViolation(err)) {
          throw err;
        }
      }
    }
    throw new Error(
      `Failed to issue invite code after ${MAX_CODE_RETRIES} attempts: ${String(
        lastErr,
      )}`,
    );
  }

  /**
   * Look up a code and atomically decrement its remaining uses. CAS-style:
   * only succeeds when `uses_remaining > 0`. On success inserts a redemption
   * row for `redeemedBy`. Meant to be called inside a transaction.
   */
  async consumeForRegistration(
    manager: EntityManager,
    code: string,
    redeemedBy: string,
  ): Promise<void> {
    const codes = manager.getRepository(InviteCodeEntity);
    const codeRow = await codes.findOne({ where: { code } });
    if (!codeRow) {
      throw new NotFoundException({
        code: 'INVITE_INVALID',
        message: '邀请码不存在',
      });
    }

    const updateResult = await manager
      .createQueryBuilder()
      .update(InviteCodeEntity)
      .set({ usesRemaining: () => '"uses_remaining" - 1' })
      .where('"id" = :id AND "uses_remaining" > 0', { id: codeRow.id })
      .execute();

    if (updateResult.affected === 0) {
      throw new ConflictException({
        code: 'INVITE_CONSUMED',
        message: '邀请码已达使用上限',
      });
    }

    const redemptions = manager.getRepository(InviteRedemptionEntity);
    try {
      await redemptions.save(
        redemptions.create({
          codeId: codeRow.id,
          redeemedBy,
        }),
      );
    } catch (err: unknown) {
      if (isUniqueViolation(err)) {
        throw new ConflictException({
          code: 'INVITE_ALREADY_REDEEMED',
          message: '你已经使用过邀请码注册',
        });
      }
      throw err;
    }
  }

  /**
   * Fetch the user's own invite code, including the list of people who
   * redeemed it (enriched with nickname).
   */
  async getMyCodeDetail(userId: string): Promise<InviteCodeDetail> {
    const codeRow = await this.codes.findOne({ where: { ownerId: userId } });
    if (!codeRow) {
      throw new NotFoundException({
        code: 'INVITE_NOT_ISSUED',
        message: '尚未生成邀请码',
      });
    }

    const rows = await this.dataSource
      .getRepository(InviteRedemptionEntity)
      .createQueryBuilder('r')
      .innerJoin(UserEntity, 'u', 'u.id = r.redeemed_by')
      .select([
        'r.redeemed_by AS "userId"',
        'u.nickname AS "nickname"',
        'r.redeemed_at AS "redeemedAt"',
      ])
      .where('r.code_id = :codeId', { codeId: codeRow.id })
      .orderBy('r.redeemed_at', 'DESC')
      .getRawMany<{
        userId: string;
        nickname: string;
        redeemedAt: Date;
      }>();

    const redemptions: InviteCodeRedemption[] = rows.map((row) => ({
      userId: row.userId,
      nickname: row.nickname,
      redeemedAt: row.redeemedAt.toISOString(),
    }));

    return {
      code: codeRow.code,
      maxUses: codeRow.maxUses,
      usesRemaining: codeRow.usesRemaining,
      redemptions,
    };
  }
}

function generateCode(): string {
  let suffix = '';
  for (let i = 0; i < CODE_SUFFIX_LEN; i += 1) {
    suffix += CROCKFORD_ALPHABET[randomInt(0, CROCKFORD_ALPHABET.length)];
  }
  return `${CODE_PREFIX}${suffix}`;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === '23505'
  );
}
