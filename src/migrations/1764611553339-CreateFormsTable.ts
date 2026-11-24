import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFormsTable1764611553339 implements MigrationInterface {
  name = "CreateFormsTable1764611553339";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`forms\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`field_options\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fieldId\` int NOT NULL, \`label\` varchar(255) NOT NULL, \`value\` varchar(255) NOT NULL, \`orderIndex\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`form_fields\` (\`id\` int NOT NULL AUTO_INCREMENT, \`formId\` int NOT NULL, \`fieldName\` varchar(100) NOT NULL, \`fieldLabel\` varchar(255) NOT NULL, \`fieldType\` varchar(50) NOT NULL, \`isRequired\` tinyint NOT NULL DEFAULT 0, \`placeholder\` varchar(255) NULL, \`defaultValue\` text NULL, \`validationRules\` json NULL, \`orderIndex\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`field_options\` ADD CONSTRAINT \`FK_e3873806c6bad1d66e33aeab573\` FOREIGN KEY (\`fieldId\`) REFERENCES \`form_fields\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`form_fields\` ADD CONSTRAINT \`FK_be6b8d137cc480508923911b0e2\` FOREIGN KEY (\`formId\`) REFERENCES \`forms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`form_fields\` DROP FOREIGN KEY \`FK_be6b8d137cc480508923911b0e2\``
    );
    await queryRunner.query(
      `ALTER TABLE \`field_options\` DROP FOREIGN KEY \`FK_e3873806c6bad1d66e33aeab573\``
    );
    await queryRunner.query(`DROP TABLE \`form_fields\``);
    await queryRunner.query(`DROP TABLE \`field_options\``);
    await queryRunner.query(`DROP TABLE \`forms\``);
  }
}
