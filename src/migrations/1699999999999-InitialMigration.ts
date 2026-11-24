import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1699999999999 implements MigrationInterface {
    name = 'InitialMigration1699999999999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create roles table
        await queryRunner.query(`
            CREATE TABLE \`roles\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(100) NOT NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdBy\` varchar(100) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`fullname\` varchar(100) NOT NULL,
                \`username\` varchar(100) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`email\` varchar(100) NOT NULL,
                \`phone\` varchar(100) NULL,
                \`roleId\` int NOT NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdBy\` varchar(100) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_username\` (\`username\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create stages table
        await queryRunner.query(`
            CREATE TABLE \`stages\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(100) NOT NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdBy\` varchar(100) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create followUp table
        await queryRunner.query(`
            CREATE TABLE \`followUp\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(100) NOT NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdBy\` varchar(100) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create leads table
        await queryRunner.query(`
            CREATE TABLE \`leads\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`fullname\` varchar(100) NOT NULL,
                \`email\` varchar(100) NOT NULL,
                \`phone\` varchar(100) NOT NULL,
                \`applying_for\` varchar(100) NULL,
                \`city\` varchar(100) NULL,
                \`currentPosition\` varchar(100) NULL,
                \`leadDate\` varchar(100) NULL,
                \`adName\` varchar(100) NULL,
                \`monthlyIncome\` int NULL,
                \`bankBalance\` int NULL,
                \`workPermit\` tinyint NOT NULL DEFAULT 0,
                \`companyName\` varchar(200) NULL,
                \`jobTitle\` varchar(200) NULL,
                \`status\` int NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdBy\` varchar(100) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create lead_assignments table
        await queryRunner.query(`
            CREATE TABLE \`lead_assignments\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`lead_id\` int NOT NULL,
                \`assigned_to\` int NOT NULL,
                \`assigned_by\` int NOT NULL,
                \`remarks\` text NULL,
                \`createdBy\` varchar(100) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create lead_history table
        await queryRunner.query(`
            CREATE TABLE \`lead_history\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`lead_id\` int NOT NULL,
                \`assigned_to\` int NOT NULL,
                \`assigned_by\` int NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create lead_attempt table
        await queryRunner.query(`
            CREATE TABLE \`lead_attempt\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`lead_id\` int NOT NULL,
                \`follow_type_id\` int NOT NULL,
                \`remarks\` varchar(100) NULL,
                \`createdBy\` varchar(100) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE \`users\` 
            ADD CONSTRAINT \`FK_users_roles\` 
            FOREIGN KEY (\`roleId\`) 
            REFERENCES \`roles\`(\`id\`) 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`leads\` 
            ADD CONSTRAINT \`FK_leads_stages\` 
            FOREIGN KEY (\`status\`) 
            REFERENCES \`stages\`(\`id\`) 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`lead_assignments\` 
            ADD CONSTRAINT \`FK_lead_assignments_leads\` 
            FOREIGN KEY (\`lead_id\`) 
            REFERENCES \`leads\`(\`id\`) 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`lead_assignments\` 
            ADD CONSTRAINT \`FK_lead_assignments_assigned_to\` 
            FOREIGN KEY (\`assigned_to\`) 
            REFERENCES \`users\`(\`id\`) 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`lead_assignments\` 
            ADD CONSTRAINT \`FK_lead_assignments_assigned_by\` 
            FOREIGN KEY (\`assigned_by\`) 
            REFERENCES \`users\`(\`id\`) 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`lead_history\` 
            ADD CONSTRAINT \`FK_lead_history_leads\` 
            FOREIGN KEY (\`lead_id\`) 
            REFERENCES \`leads\`(\`id\`) 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`lead_history\` 
            ADD CONSTRAINT \`FK_lead_history_assigned_to\` 
            FOREIGN KEY (\`assigned_to\`) 
            REFERENCES \`users\`(\`id\`) 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`lead_history\` 
            ADD CONSTRAINT \`FK_lead_history_assigned_by\` 
            FOREIGN KEY (\`assigned_by\`) 
            REFERENCES \`users\`(\`id\`) 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`lead_attempt\` 
            ADD CONSTRAINT \`FK_lead_attempt_leads\` 
            FOREIGN KEY (\`lead_id\`) 
            REFERENCES \`leads\`(\`id\`) 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`lead_attempt\` 
            ADD CONSTRAINT \`FK_lead_attempt_followUp\` 
            FOREIGN KEY (\`follow_type_id\`) 
            REFERENCES \`followUp\`(\`id\`) 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE \`lead_attempt\` DROP FOREIGN KEY \`FK_lead_attempt_followUp\``);
        await queryRunner.query(`ALTER TABLE \`lead_attempt\` DROP FOREIGN KEY \`FK_lead_attempt_leads\``);
        await queryRunner.query(`ALTER TABLE \`lead_history\` DROP FOREIGN KEY \`FK_lead_history_assigned_by\``);
        await queryRunner.query(`ALTER TABLE \`lead_history\` DROP FOREIGN KEY \`FK_lead_history_assigned_to\``);
        await queryRunner.query(`ALTER TABLE \`lead_history\` DROP FOREIGN KEY \`FK_lead_history_leads\``);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` DROP FOREIGN KEY \`FK_lead_assignments_assigned_by\``);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` DROP FOREIGN KEY \`FK_lead_assignments_assigned_to\``);
        await queryRunner.query(`ALTER TABLE \`lead_assignments\` DROP FOREIGN KEY \`FK_lead_assignments_leads\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP FOREIGN KEY \`FK_leads_stages\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_users_roles\``);

        // Drop tables
        await queryRunner.query(`DROP TABLE \`lead_attempt\``);
        await queryRunner.query(`DROP TABLE \`lead_history\``);
        await queryRunner.query(`DROP TABLE \`lead_assignments\``);
        await queryRunner.query(`DROP TABLE \`leads\``);
        await queryRunner.query(`DROP TABLE \`followUp\``);
        await queryRunner.query(`DROP TABLE \`stages\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
    }
}

