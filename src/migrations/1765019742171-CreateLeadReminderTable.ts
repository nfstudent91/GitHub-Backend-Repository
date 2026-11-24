import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLeadReminderTable1765019742171
  implements MigrationInterface
{
  name = "CreateLeadReminderTable1765019742171";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`lead_reminder\` (\`id\` int NOT NULL AUTO_INCREMENT, \`lead_id\` int NOT NULL, \`user_id\` int NOT NULL, \`title\` varchar(200) NOT NULL, \`description\` text NULL, \`reminder_date_time\` datetime NOT NULL, \`status\` enum ('pending', 'completed', 'dismissed') NOT NULL DEFAULT 'pending', \`type\` enum ('email', 'notification', 'sms') NOT NULL DEFAULT 'notification', \`createdBy\` varchar(100) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`lead_reminder\` ADD CONSTRAINT \`FK_ed20138e377d6be20a177f2a8c5\` FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`lead_reminder\` ADD CONSTRAINT \`FK_948a9b419d96525ee6772f8c031\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`lead_reminder\` DROP FOREIGN KEY \`FK_948a9b419d96525ee6772f8c031\``
    );
    await queryRunner.query(
      `ALTER TABLE \`lead_reminder\` DROP FOREIGN KEY \`FK_ed20138e377d6be20a177f2a8c5\``
    );
    await queryRunner.query(`DROP TABLE \`lead_reminder\``);
  }
}
