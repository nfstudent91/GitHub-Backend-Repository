import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsLeadTable1766854427869 implements MigrationInterface {
  name = "AddColumnsLeadTable1766854427869";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`fullname\` varchar(100) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`email\` varchar(100) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`phone\` varchar(100) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`whatsapp\` varchar(100) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`leadDate\` varchar(100) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`leadSource\` varchar(100) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`leadSubsource\` varchar(100) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`monthlyIncome\` int NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`jobTitle\` varchar(200) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`jobTitle\``);
    await queryRunner.query(
      `ALTER TABLE \`leads\` DROP COLUMN \`monthlyIncome\``
    );
    await queryRunner.query(
      `ALTER TABLE \`leads\` DROP COLUMN \`leadSubsource\``
    );
    await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`leadSource\``);
    await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`leadDate\``);
    await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`whatsapp\``);
    await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`phone\``);
    await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`email\``);
    await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`fullname\``);
  }
}
