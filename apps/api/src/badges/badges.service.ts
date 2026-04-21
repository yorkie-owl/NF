import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  BadgeDefinition,
  UserBadge,
} from '@lin-shi/contracts';
import { BadgeEntity } from './entities/badge.entity';
import { UserBadgeEntity } from './entities/user-badge.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(BadgeEntity)
    private readonly badges: Repository<BadgeEntity>,
    @InjectRepository(UserBadgeEntity)
    private readonly userBadges: Repository<UserBadgeEntity>,
  ) {}

  async listAll(): Promise<BadgeDefinition[]> {
    const rows = await this.badges.find({ order: { code: 'ASC' } });
    return rows.map((row) => ({
      code: row.code,
      name: row.name,
      description: row.description ?? null,
      iconUrl: row.iconUrl ?? null,
    }));
  }

  async listForUser(userId: string): Promise<UserBadge[]> {
    const rows = await this.userBadges.find({
      where: { userId },
      order: { earnedAt: 'DESC' },
    });
    return rows.map((row) => ({
      code: row.badgeCode,
      earnedAt: row.earnedAt.toISOString(),
    }));
  }
}
