import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableAccounts1749622213519 implements MigrationInterface {
  name = 'AlterTableAccounts1749622213519';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD "password" text
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "accounts" DROP COLUMN "password"
        `);
  }
}
