import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedDocumentLabelTable1766946215321
  implements MigrationInterface
{
  name = "ModifiedDocumentLabelTable1766946215321";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` CHANGE \`imageLabel\` \`documentLabel\` varchar(255) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`document_uploads\` CHANGE \`documentLabel\` \`imageLabel\` varchar(255) NULL`
    );
  }
}
