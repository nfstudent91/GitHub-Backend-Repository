import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDocumentUploadTable1766932427928
  implements MigrationInterface
{
  name = "CreateDocumentUploadTable1766932427928";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`document_uploads\` (\`id\` int NOT NULL AUTO_INCREMENT, \`filename\` varchar(255) NOT NULL, \`originalName\` varchar(255) NOT NULL, \`url\` varchar(500) NOT NULL, \`mimeType\` varchar(100) NULL, \`size\` int NULL, \`leadId\` int NULL, \`uploadedBy\` varchar(100) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`document_uploads\``);
  }
}
