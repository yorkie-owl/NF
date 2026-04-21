import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModuleAInitial20260420100000 implements MigrationInterface {
  name = 'ModuleAInitial20260420100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // gen_random_uuid() is provided by pgcrypto on PG 13+; ensure extension exists.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // u_users
    await queryRunner.query(`
      CREATE TABLE "u_users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "nickname" VARCHAR(20) NOT NULL,
        "avatar_url" VARCHAR(500),
        "school" VARCHAR(100),
        "city" VARCHAR(50),
        "bio" VARCHAR(140),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "last_login_at" TIMESTAMPTZ
      )
    `);

    // u_refresh_tokens
    await queryRunner.query(`
      CREATE TABLE "u_refresh_tokens" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "u_users"("id") ON DELETE CASCADE,
        "token_hash" VARCHAR(255) NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "revoked_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_u_refresh_tokens_user_id_revoked_at" ON "u_refresh_tokens" ("user_id", "revoked_at")`,
    );

    // u_invite_codes
    await queryRunner.query(`
      CREATE TABLE "u_invite_codes" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_id" UUID NOT NULL REFERENCES "u_users"("id") ON DELETE CASCADE,
        "code" VARCHAR(10) UNIQUE NOT NULL,
        "max_uses" INTEGER NOT NULL DEFAULT 3,
        "uses_remaining" INTEGER NOT NULL DEFAULT 3,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_u_invite_codes_owner_id" ON "u_invite_codes" ("owner_id")`,
    );

    // u_invite_redemptions
    await queryRunner.query(`
      CREATE TABLE "u_invite_redemptions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "code_id" UUID NOT NULL REFERENCES "u_invite_codes"("id") ON DELETE CASCADE,
        "redeemed_by" UUID NOT NULL REFERENCES "u_users"("id"),
        "redeemed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_u_invite_redemptions_code_id" ON "u_invite_redemptions" ("code_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_u_invite_redemptions_redeemed_by" ON "u_invite_redemptions" ("redeemed_by")`,
    );

    // u_friend_preferences
    await queryRunner.query(`
      CREATE TABLE "u_friend_preferences" (
        "user_id" UUID PRIMARY KEY REFERENCES "u_users"("id") ON DELETE CASCADE,
        "accept_strangers" BOOLEAN NOT NULL DEFAULT false,
        "distance_km" INTEGER NOT NULL DEFAULT 5,
        "time_slots" JSONB NOT NULL DEFAULT '[]'::JSONB,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // u_food_preferences
    await queryRunner.query(`
      CREATE TABLE "u_food_preferences" (
        "user_id" UUID PRIMARY KEY REFERENCES "u_users"("id") ON DELETE CASCADE,
        "cuisines" TEXT[] NOT NULL DEFAULT '{}',
        "dietary_restrictions" TEXT[] NOT NULL DEFAULT '{}',
        "cooking_skill" VARCHAR(20) NOT NULL DEFAULT 'BEGINNER',
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // u_badges
    await queryRunner.query(`
      CREATE TABLE "u_badges" (
        "code" VARCHAR(32) PRIMARY KEY,
        "name" VARCHAR(50) NOT NULL,
        "description" VARCHAR(200),
        "icon_url" VARCHAR(500)
      )
    `);

    // u_user_badges
    await queryRunner.query(`
      CREATE TABLE "u_user_badges" (
        "user_id" UUID NOT NULL REFERENCES "u_users"("id") ON DELETE CASCADE,
        "badge_code" VARCHAR(32) NOT NULL REFERENCES "u_badges"("code"),
        "earned_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY ("user_id", "badge_code")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_u_user_badges_user_id" ON "u_user_badges" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "u_user_badges"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "u_badges"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "u_food_preferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "u_friend_preferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "u_invite_redemptions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "u_invite_codes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "u_refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "u_users"`);
  }
}
