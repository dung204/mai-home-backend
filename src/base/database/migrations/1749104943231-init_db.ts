import { readFile } from 'fs/promises';
import { join } from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDb1749104943231 implements MigrationInterface {
  name = 'InitDb1749104943231';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."Role" AS ENUM('USER', 'ADMIN')
        `);
    await queryRunner.query(`
            CREATE TABLE "accounts" (
                "create_timestamp" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "update_timestamp" TIMESTAMP(3) WITH TIME ZONE DEFAULT now(),
                "delete_timestamp" TIMESTAMP(3) WITH TIME ZONE,
                "create_user_id" uuid,
                "update_user_id" uuid,
                "delete_user_id" uuid,
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "phone" character varying(12),
                "email" character varying(256),
                "password" text,
                "role" "public"."Role" NOT NULL DEFAULT 'USER',
                "google_id" character varying,
                CONSTRAINT "UQ_41704a57004fc60242d7996bd85" UNIQUE ("phone"),
                CONSTRAINT "UQ_ee66de6cdc53993296d1ceb8aa0" UNIQUE ("email"),
                CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "users" (
                "create_timestamp" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "update_timestamp" TIMESTAMP(3) WITH TIME ZONE DEFAULT now(),
                "delete_timestamp" TIMESTAMP(3) WITH TIME ZONE,
                "create_user_id" uuid,
                "update_user_id" uuid,
                "delete_user_id" uuid,
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "display_name" character varying(128),
                "avatar" text,
                "account_id" uuid,
                CONSTRAINT "REL_17a709b8b6146c491e6615c29d" UNIQUE ("account_id"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "cities" (
                "create_timestamp" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "update_timestamp" TIMESTAMP(3) WITH TIME ZONE DEFAULT now(),
                "delete_timestamp" TIMESTAMP(3) WITH TIME ZONE,
                "create_user_id" uuid,
                "update_user_id" uuid,
                "delete_user_id" uuid,
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "PK_4762ffb6e5d198cfec5606bc11e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "districts" (
                "create_timestamp" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "update_timestamp" TIMESTAMP(3) WITH TIME ZONE DEFAULT now(),
                "delete_timestamp" TIMESTAMP(3) WITH TIME ZONE,
                "create_user_id" uuid,
                "update_user_id" uuid,
                "delete_user_id" uuid,
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "city_id" character varying,
                CONSTRAINT "PK_972a72ff4e3bea5c7f43a2b98af" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "wards" (
                "create_timestamp" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "update_timestamp" TIMESTAMP(3) WITH TIME ZONE DEFAULT now(),
                "delete_timestamp" TIMESTAMP(3) WITH TIME ZONE,
                "create_user_id" uuid,
                "update_user_id" uuid,
                "delete_user_id" uuid,
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "district_id" character varying,
                CONSTRAINT "PK_f67afa72e02ac056570c0dde279" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."PropertyCategory" AS ENUM('ROOM', 'APARTMENT', 'HOUSE', 'SHARED')
        `);
    await queryRunner.query(`
            CREATE TABLE "properties" (
                "create_timestamp" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "update_timestamp" TIMESTAMP(3) WITH TIME ZONE DEFAULT now(),
                "delete_timestamp" TIMESTAMP(3) WITH TIME ZONE,
                "create_user_id" uuid,
                "update_user_id" uuid,
                "delete_user_id" uuid,
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(100) NOT NULL,
                "description" text NOT NULL,
                "category" "public"."PropertyCategory" NOT NULL,
                "city_id" character varying NOT NULL,
                "district_id" character varying NOT NULL,
                "ward_id" character varying NOT NULL,
                "address" character varying NOT NULL,
                "latitude" numeric(10, 8),
                "longitude" numeric(11, 8),
                "price_per_month" numeric(15, 2) NOT NULL,
                "area" numeric(6, 2) NOT NULL,
                "images" text array NOT NULL DEFAULT '{}',
                "videos" text array NOT NULL DEFAULT '{}',
                "owner_id" uuid,
                CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_17a709b8b6146c491e6615c29d7" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "districts"
            ADD CONSTRAINT "FK_d7d1704cfb8bc19fb0d9c2f7ced" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "wards"
            ADD CONSTRAINT "FK_3d1ef92876a28d10ac2d3fe766b" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "properties"
            ADD CONSTRAINT "FK_797b76e2d11a5bf755127d1aa67" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "properties"
            ADD CONSTRAINT "FK_e84dd96eca02f3de6007a22f7fb" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "properties"
            ADD CONSTRAINT "FK_b61dcfd1fe20c84397b07551564" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "properties"
            ADD CONSTRAINT "FK_50ef874d78e1463a4925c88b7d8" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(
      await readFile(join(__dirname, '../scripts/cities.sql'), { encoding: 'utf-8' }),
    );
    await queryRunner.query(
      await readFile(join(__dirname, '../scripts/districts.sql'), { encoding: 'utf-8' }),
    );
    await queryRunner.query(
      await readFile(join(__dirname, '../scripts/wards.sql'), { encoding: 'utf-8' }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "properties" DROP CONSTRAINT "FK_50ef874d78e1463a4925c88b7d8"
        `);
    await queryRunner.query(`
            ALTER TABLE "properties" DROP CONSTRAINT "FK_b61dcfd1fe20c84397b07551564"
        `);
    await queryRunner.query(`
            ALTER TABLE "properties" DROP CONSTRAINT "FK_e84dd96eca02f3de6007a22f7fb"
        `);
    await queryRunner.query(`
            ALTER TABLE "properties" DROP CONSTRAINT "FK_797b76e2d11a5bf755127d1aa67"
        `);
    await queryRunner.query(`
            ALTER TABLE "wards" DROP CONSTRAINT "FK_3d1ef92876a28d10ac2d3fe766b"
        `);
    await queryRunner.query(`
            ALTER TABLE "districts" DROP CONSTRAINT "FK_d7d1704cfb8bc19fb0d9c2f7ced"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_17a709b8b6146c491e6615c29d7"
        `);
    await queryRunner.query(`
            DROP TABLE "properties"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."PropertyCategory"
        `);
    await queryRunner.query(`
            DROP TABLE "wards"
        `);
    await queryRunner.query(`
            DROP TABLE "districts"
        `);
    await queryRunner.query(`
            DROP TABLE "cities"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
    await queryRunner.query(`
            DROP TABLE "accounts"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."Role"
        `);
  }
}
