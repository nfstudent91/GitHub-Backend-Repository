import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsLeadAttemptTable1765044993847
  implements MigrationInterface
{
  name = "AddColumnsLeadAttemptTable1765044993847";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`lead_attempt\` ADD \`outcome\` varchar(50) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`lead_attempt\` ADD \`callTime\` datetime NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`lead_attempt\` ADD \`duration\` int NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`lead_attempt\` ADD \`scheduledTime\` datetime NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`lead_attempt\` DROP COLUMN \`scheduledTime\``
    );
    await queryRunner.query(
      `ALTER TABLE \`lead_attempt\` DROP COLUMN \`duration\``
    );
    await queryRunner.query(
      `ALTER TABLE \`lead_attempt\` DROP COLUMN \`callTime\``
    );
    await queryRunner.query(
      `ALTER TABLE \`lead_attempt\` DROP COLUMN \`outcome\``
    );
  }
}
