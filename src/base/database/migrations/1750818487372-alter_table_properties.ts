import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableProperties1750818487372 implements MigrationInterface {
  name = 'AlterTableProperties1750818487372';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "properties"
        ADD "min_price_per_month" numeric(15, 2)
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ADD "max_price_per_month" numeric(15, 2)
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ADD "min_area" numeric(6, 2)
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ADD "max_area" numeric(6, 2)
    `);
    await queryRunner.query(`
        UPDATE "properties" SET "min_price_per_month" = "price_per_month", "max_price_per_month" = "price_per_month"
    `);
    await queryRunner.query(`
        UPDATE "properties" SET "min_area" = "area", "max_area" = "area"
    `);
    await queryRunner.query(`
        ALTER TABLE "properties" DROP COLUMN "price_per_month"
    `);
    await queryRunner.query(`
        ALTER TABLE "properties" DROP COLUMN "area"
    `);
    await queryRunner.query(`
        ALTER TABLE "properties" DROP CONSTRAINT "FK_797b76e2d11a5bf755127d1aa67"
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ALTER COLUMN "owner_id"
        SET NOT NULL
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ADD CONSTRAINT "FK_797b76e2d11a5bf755127d1aa67" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ALTER COLUMN "min_price_per_month"
        SET NOT NULL
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ALTER COLUMN "max_price_per_month"
        SET NOT NULL
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ALTER COLUMN "min_area"
        SET NOT NULL
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ALTER COLUMN "max_area"
        SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "properties" DROP CONSTRAINT "FK_797b76e2d11a5bf755127d1aa67"
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ALTER COLUMN "owner_id" DROP NOT NULL
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ADD CONSTRAINT "FK_797b76e2d11a5bf755127d1aa67" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ADD "area" numeric(6, 2)
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ADD "price_per_month" numeric(15, 2)
    `);
    await queryRunner.query(`
      UPDATE "properties" SET "price_per_month" = "min_price_per_month"
  `);
    await queryRunner.query(`
      UPDATE "properties" SET "area" = "min_area"
  `);
    await queryRunner.query(`
        ALTER TABLE "properties" DROP COLUMN "max_area"
    `);
    await queryRunner.query(`
        ALTER TABLE "properties" DROP COLUMN "min_area"
    `);
    await queryRunner.query(`
        ALTER TABLE "properties" DROP COLUMN "max_price_per_month"
    `);
    await queryRunner.query(`
        ALTER TABLE "properties" DROP COLUMN "min_price_per_month"
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ALTER COLUMN "area"
        SET NOT NULL
    `);
    await queryRunner.query(`
        ALTER TABLE "properties"
        ALTER COLUMN "price_per_month"
        SET NOT NULL
    `);
  }
}
