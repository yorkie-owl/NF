import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModuleCInitial20260420110000 implements MigrationInterface {
  name = 'ModuleCInitial20260420110000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // a_activities
    await queryRunner.query(`
      CREATE TABLE "a_activities" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" VARCHAR(80) NOT NULL,
        "description" VARCHAR(500),
        "start_time" TIMESTAMPTZ NOT NULL,
        "location" VARCHAR(200) NOT NULL,
        "max_participants" INTEGER NOT NULL CHECK ("max_participants" BETWEEN 2 AND 10),
        "join_scope" VARCHAR(30) NOT NULL,
        "status" VARCHAR(30) NOT NULL DEFAULT 'WAITING_FOR_MEMBERS',
        "created_by" UUID NOT NULL REFERENCES "u_users"("id"),
        "chat_room_id" UUID,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "cancelled_at" TIMESTAMPTZ,
        "completed_at" TIMESTAMPTZ
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_a_activities_status_start_time" ON "a_activities" ("status", "start_time")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a_activities_created_by" ON "a_activities" ("created_by")`,
    );

    // a_activity_participants
    await queryRunner.query(`
      CREATE TABLE "a_activity_participants" (
        "activity_id" UUID NOT NULL REFERENCES "a_activities"("id") ON DELETE CASCADE,
        "user_id" UUID NOT NULL REFERENCES "u_users"("id"),
        "joined_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "left_at" TIMESTAMPTZ,
        PRIMARY KEY ("activity_id", "user_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_a_activity_participants_user_id" ON "a_activity_participants" ("user_id")`,
    );

    // a_activity_ingredients (B 已就绪时用)
    await queryRunner.query(`
      CREATE TABLE "a_activity_ingredients" (
        "activity_id" UUID NOT NULL REFERENCES "a_activities"("id") ON DELETE CASCADE,
        "ingredient_id" UUID NOT NULL,
        "added_by" UUID NOT NULL REFERENCES "u_users"("id"),
        "added_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY ("activity_id", "ingredient_id")
      )
    `);

    // a_activity_manual_ingredients (B 未就绪 fallback)
    await queryRunner.query(`
      CREATE TABLE "a_activity_manual_ingredients" (
        "activity_id" UUID NOT NULL REFERENCES "a_activities"("id") ON DELETE CASCADE,
        "name" VARCHAR(50) NOT NULL,
        "added_by" UUID NOT NULL REFERENCES "u_users"("id"),
        "added_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY ("activity_id", "name")
      )
    `);

    // a_activity_events
    await queryRunner.query(`
      CREATE TABLE "a_activity_events" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "activity_id" UUID NOT NULL REFERENCES "a_activities"("id") ON DELETE CASCADE,
        "type" VARCHAR(30) NOT NULL,
        "actor_id" UUID REFERENCES "u_users"("id"),
        "payload" JSONB NOT NULL DEFAULT '{}'::JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_a_activity_events_activity_created" ON "a_activity_events" ("activity_id", "created_at" DESC)`,
    );

    // a_activity_feed_reads
    await queryRunner.query(`
      CREATE TABLE "a_activity_feed_reads" (
        "user_id" UUID NOT NULL REFERENCES "u_users"("id") ON DELETE CASCADE,
        "activity_id" UUID NOT NULL REFERENCES "a_activities"("id") ON DELETE CASCADE,
        "last_read_at" TIMESTAMPTZ NOT NULL,
        PRIMARY KEY ("user_id", "activity_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "a_activity_feed_reads"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "a_activity_events"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "a_activity_manual_ingredients"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "a_activity_ingredients"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "a_activity_participants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "a_activities"`);
  }
}
