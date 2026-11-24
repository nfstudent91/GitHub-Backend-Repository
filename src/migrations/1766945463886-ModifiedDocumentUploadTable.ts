import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedDocumentUploadTable1766945463886
  implements MigrationInterface
{
  name = "ModifiedDocumentUploadTable1766945463886";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` DROP COLUMN \`filename\``
    );
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` DROP COLUMN \`originalName\``
    );
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` DROP COLUMN \`mimeType\``
    );
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` DROP COLUMN \`size\``
    );
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` ADD \`imageLabel\` varchar(255) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` ADD \`expiryDate\` varchar(255) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` CHANGE \`url\` \`url\` varchar(500) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` CHANGE \`url\` \`url\` varchar(500) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` DROP COLUMN \`expiryDate\``
    );
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` DROP COLUMN \`imageLabel\``
    );
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` ADD \`size\` int NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` ADD \`mimeType\` varchar(100) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` ADD \`originalName\` varchar(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` ADD \`filename\` varchar(255) NOT NULL`
    );
  }
}
