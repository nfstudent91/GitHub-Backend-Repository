import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotesTable1767379668708 implements MigrationInterface {
  name = "CreateNotesTable1767379668708";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`notes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`lead_id\` int NOT NULL, \`text\` text NOT NULL, \`createdBy\` varchar(100) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`notes\` ADD CONSTRAINT \`FK_e2da26cfd97f7b99b7df5d6389e\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notes\` DROP FOREIGN KEY \`FK_e2da26cfd97f7b99b7df5d6389e\``
    );
    await queryRunner.query(`DROP TABLE \`notes\``);
  }
}
