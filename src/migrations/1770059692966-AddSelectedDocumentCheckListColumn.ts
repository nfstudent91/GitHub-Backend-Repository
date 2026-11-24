import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSelectedDocumentCheckListColumn1770059692966 implements MigrationInterface {
  name = "AddSelectedDocumentCheckListColumn1770059692966";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`selectedDocumentCheckList\` varchar(100) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`leads\` DROP COLUMN \`selectedDocumentCheckList\``,
    );
  }
}
