import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableReviews1749178503856 implements MigrationInterface {
  name = 'CreateTableReviews1749178503856';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "reviews" (
                "create_timestamp" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "update_timestamp" TIMESTAMP(3) WITH TIME ZONE DEFAULT now(),
                "delete_timestamp" TIMESTAMP(3) WITH TIME ZONE,
                "create_user_id" uuid,
                "update_user_id" uuid,
                "delete_user_id" uuid,
                "user_id" uuid NOT NULL,
                "property_id" uuid NOT NULL,
                "stars" integer NOT NULL,
                "content" text NOT NULL,
                CONSTRAINT "PK_8429ece1c43c12bcce05b6ad1b9" PRIMARY KEY ("user_id", "property_id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews"
            ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews"
            ADD CONSTRAINT "FK_2b1e1cd13649e9315b28b7f2f0c" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "reviews" DROP CONSTRAINT "FK_2b1e1cd13649e9315b28b7f2f0c"
        `);
    await queryRunner.query(`
            ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"
        `);
    await queryRunner.query(`
            DROP TABLE "reviews"
        `);
  }
}
