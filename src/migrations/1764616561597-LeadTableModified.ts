import { MigrationInterface, QueryRunner } from "typeorm";

export class LeadTableModified1764616561597 implements MigrationInterface {
    name = 'LeadTableModified1764616561597'
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`adName\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`applying_for\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`bankBalance\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`city\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`companyName\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`currentPosition\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`fullname\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`jobTitle\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`leadDate\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`monthlyIncome\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`phone\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`workPermit\``);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`formData\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`formData\``);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`workPermit\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`phone\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`monthlyIncome\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`leadDate\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`jobTitle\` varchar(200) NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`fullname\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`email\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`currentPosition\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`companyName\` varchar(200) NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`city\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`bankBalance\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`applying_for\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`adName\` varchar(100) NULL`);
    }

}
