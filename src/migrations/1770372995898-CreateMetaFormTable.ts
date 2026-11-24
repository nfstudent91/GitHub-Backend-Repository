import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMetaFormTable1770372995898 implements MigrationInterface {
    name = 'CreateMetaFormTable1770372995898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`lead_history\` DROP FOREIGN KEY \`FK_lead_history_assigned_by\``);
        await queryRunner.query(`ALTER TABLE \`lead_history\` DROP FOREIGN KEY \`FK_lead_history_assigned_to\``);
        await queryRunner.query(`ALTER TABLE \`lead_history\` DROP FOREIGN KEY \`FK_lead_history_leads\``);
        await queryRunner.query(`ALTER TABLE \`lead_attempt\` DROP FOREIGN KEY \`FK_lead_attempt_followUp\``);
        await queryRunner.query(`ALTER TABLE \`lead_attempt\` DROP FOREIGN KEY \`FK_lead_attempt_leads\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP FOREIGN KEY \`FK_leads_stages\``);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` DROP FOREIGN KEY \`FK_lead_assignments_assigned_by\``);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` DROP FOREIGN KEY \`FK_lead_assignments_assigned_to\``);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` DROP FOREIGN KEY \`FK_lead_assignments_leads\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_users_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_username\` ON \`users\``);
        await queryRunner.query(`CREATE TABLE \`meta_forms\` (\`id\` int NOT NULL AUTO_INCREMENT, \`formId\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_8768c63f221e48a261d9e4b9f9\` (\`formId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`)`);
        await queryRunner.query(`ALTER TABLE \`lead_history\` ADD CONSTRAINT \`FK_fce43474e4b1b9081855928622c\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_history\` ADD CONSTRAINT \`FK_8e13b2612b14cada65d036e35cd\` FOREIGN KEY (\`assigned_to\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_history\` ADD CONSTRAINT \`FK_882b6faa53370ca9f9756067ebc\` FOREIGN KEY (\`assigned_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_attempt\` ADD CONSTRAINT \`FK_ac8e90d3de29658f79f0739ee01\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_attempt\` ADD CONSTRAINT \`FK_b14316bd60eb9f787223be7b47c\` FOREIGN KEY (\`follow_type_id\`) REFERENCES \`followUp\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`document_uploads\` ADD CONSTRAINT \`FK_41a51946d3455ee581dc8c1b460\` FOREIGN KEY (\`leadId\`) REFERENCES \`leads\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD CONSTRAINT \`FK_7e752ea7ad7cbfb9ca515ebf5af\` FOREIGN KEY (\`stageId\`) REFERENCES \`stages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` ADD CONSTRAINT \`FK_df57ae2f3bbe81624285bf3542d\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` ADD CONSTRAINT \`FK_2cfcbc609ddef60263e829719d7\` FOREIGN KEY (\`assigned_to\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` ADD CONSTRAINT \`FK_df31b65a794ea0e31666789fbf0\` FOREIGN KEY (\`assigned_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_368e146b785b574f42ae9e53d5e\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_368e146b785b574f42ae9e53d5e\``);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` DROP FOREIGN KEY \`FK_df31b65a794ea0e31666789fbf0\``);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` DROP FOREIGN KEY \`FK_2cfcbc609ddef60263e829719d7\``);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` DROP FOREIGN KEY \`FK_df57ae2f3bbe81624285bf3542d\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP FOREIGN KEY \`FK_7e752ea7ad7cbfb9ca515ebf5af\``);
        await queryRunner.query(`ALTER TABLE \`document_uploads\` DROP FOREIGN KEY \`FK_41a51946d3455ee581dc8c1b460\``);
        await queryRunner.query(`ALTER TABLE \`lead_attempt\` DROP FOREIGN KEY \`FK_b14316bd60eb9f787223be7b47c\``);
        await queryRunner.query(`ALTER TABLE \`lead_attempt\` DROP FOREIGN KEY \`FK_ac8e90d3de29658f79f0739ee01\``);
        await queryRunner.query(`ALTER TABLE \`lead_history\` DROP FOREIGN KEY \`FK_882b6faa53370ca9f9756067ebc\``);
        await queryRunner.query(`ALTER TABLE \`lead_history\` DROP FOREIGN KEY \`FK_8e13b2612b14cada65d036e35cd\``);
        await queryRunner.query(`ALTER TABLE \`lead_history\` DROP FOREIGN KEY \`FK_fce43474e4b1b9081855928622c\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\``);
        await queryRunner.query(`DROP INDEX \`IDX_8768c63f221e48a261d9e4b9f9\` ON \`meta_forms\``);
        await queryRunner.query(`DROP TABLE \`meta_forms\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_username\` ON \`users\` (\`username\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_users_roles\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` ADD CONSTRAINT \`FK_lead_assignments_leads\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` ADD CONSTRAINT \`FK_lead_assignments_assigned_to\` FOREIGN KEY (\`assigned_to\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` ADD CONSTRAINT \`FK_lead_assignments_assigned_by\` FOREIGN KEY (\`assigned_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD CONSTRAINT \`FK_leads_stages\` FOREIGN KEY (\`stageId\`) REFERENCES \`stages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_attempt\` ADD CONSTRAINT \`FK_lead_attempt_leads\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_attempt\` ADD CONSTRAINT \`FK_lead_attempt_followUp\` FOREIGN KEY (\`follow_type_id\`) REFERENCES \`followUp\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_history\` ADD CONSTRAINT \`FK_lead_history_leads\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_history\` ADD CONSTRAINT \`FK_lead_history_assigned_to\` FOREIGN KEY (\`assigned_to\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lead_history\` ADD CONSTRAINT \`FK_lead_history_assigned_by\` FOREIGN KEY (\`assigned_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
