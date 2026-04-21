import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBadges20260420100001 implements MigrationInterface {
  name = 'SeedBadges20260420100001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // icon_url is NULL for MVP (frontend renders Lucide fallback; see DECISIONS §5).
    await queryRunner.query(
      `INSERT INTO "u_badges" ("code", "name", "description", "icon_url") VALUES
         ('taste_master',   '口味达人', '尝试 5 种以上不同菜系',      NULL),
         ('healthy_life',   '健康生活', '连续 7 天记录健康食材',       NULL),
         ('warm_host',      '热情房主', '作为锅主成功主持 3 场活动',   NULL),
         ('punctual_diner', '准时达人', '10 次活动 100% 准时，无爽约', NULL)
       ON CONFLICT ("code") DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "u_badges" WHERE "code" IN ('taste_master', 'healthy_life', 'warm_host', 'punctual_diner')`,
    );
  }
}
