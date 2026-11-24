import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusColumnInDocumentUploadTable1768592077558 implements MigrationInterface {
  name = "AddStatusColumnInDocumentUploadTable1768592077558";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` ADD \`status\` varchar(255) NULL DEFAULT 'Pending'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` DROP COLUMN \`status\``
    );
  }
}
