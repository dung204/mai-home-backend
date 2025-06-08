import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableTransactions1749314905419 implements MigrationInterface {
  name = 'CreateTableTransactions1749314905419';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "transactions" (
                "create_timestamp" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "update_timestamp" TIMESTAMP(3) WITH TIME ZONE DEFAULT now(),
                "delete_timestamp" TIMESTAMP(3) WITH TIME ZONE,
                "create_user_id" uuid,
                "update_user_id" uuid,
                "delete_user_id" uuid,
                "id" character varying NOT NULL,
                "amount" integer NOT NULL,
                "user_id" uuid,
                CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "transactions" DROP CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b"
        `);
    await queryRunner.query(`
            DROP TABLE "transactions"
        `);
  }
}
