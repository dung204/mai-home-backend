import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableAccounts1749452243472 implements MigrationInterface {
  name = 'AlterTableAccounts1749452243472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP COLUMN "password"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD "password" text
        `);
  }
}
