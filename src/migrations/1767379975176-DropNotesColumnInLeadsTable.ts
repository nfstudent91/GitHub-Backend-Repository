import { MigrationInterface, QueryRunner } from "typeorm";

export class DropNotesColumnInLeadsTable1767379975176
  implements MigrationInterface
{
  name = "DropNotesColumnInLeadsTable1767379975176";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`notes\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`leads\` ADD \`notes\` json NULL`);
  }
}
