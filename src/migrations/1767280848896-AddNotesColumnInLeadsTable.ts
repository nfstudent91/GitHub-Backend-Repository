import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotesColumnInLeadsTable1767280848896
  implements MigrationInterface
{
  name = "AddNotesColumnInLeadsTable1767280848896";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`leads\` ADD \`notes\` json NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`notes\``);
  }
}
