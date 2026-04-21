import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates a system user and a test invite code `LINSH-TEST`
 * with 999/999 uses for bootstrap/test workflows.
 */
export class SeedSystemUserAndTestCode20260420100002
  implements MigrationInterface
{
  name = 'SeedSystemUserAndTestCode20260420100002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = await queryRunner.query(
      `INSERT INTO "u_users" ("email", "password_hash", "nickname")
       VALUES ('system@lin-shi.internal', 'x', 'system')
       ON CONFLICT ("email") DO UPDATE SET "email" = EXCLUDED."email"
       RETURNING "id"`,
    );
    const systemUserRow = Array.isArray(rows) ? rows[0] : undefined;
    if (
      !systemUserRow ||
      typeof systemUserRow !== 'object' ||
      !('id' in systemUserRow)
    ) {
      throw new Error('Failed to upsert system user');
    }
    const systemUserId: string = (systemUserRow as { id: string }).id;

    await queryRunner.query(
      `INSERT INTO "u_invite_codes" ("owner_id", "code", "max_uses", "uses_remaining")
       VALUES ($1, 'LINSH-TEST', 999, 999)
       ON CONFLICT ("code") DO NOTHING`,
      [systemUserId],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "u_invite_codes" WHERE "code" = 'LINSH-TEST'`,
    );
    await queryRunner.query(
      `DELETE FROM "u_users" WHERE "email" = 'system@lin-shi.internal'`,
    );
  }
}
