import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveEnumFromStatusColumn1767807390863
  implements MigrationInterface
{
  name = "RemoveEnumFromStatusColumn1767807390863";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`status\``);
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`status\` varchar(255) NULL DEFAULT 'New'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`status\``);
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`status\` enum ('New', 'Not Answered', 'Busy', 'Answered', 'Follow Up', 'Meeting Scheduled', 'Meeting Done', 'Agreement Pending', 'Agreement Done', 'Payment Pending', 'Payment Done', 'Completed', 'Documentation', 'Not Interested') NULL DEFAULT 'New'`
    );
  }
}
