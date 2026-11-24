import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCanAccessPreviousLogsColumnAddedInLeadsTable1767382737248
  implements MigrationInterface
{
  name = "AddCanAccessPreviousLogsColumnAddedInLeadsTable1767382737248";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`lead_assignments\` ADD \`can_access_previous_logs\` tinyint NOT NULL DEFAULT 1`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`lead_assignments\` DROP COLUMN \`can_access_previous_logs\``
    );
  }
}
