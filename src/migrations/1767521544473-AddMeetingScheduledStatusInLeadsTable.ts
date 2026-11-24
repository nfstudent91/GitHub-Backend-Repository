import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMeetingScheduledStatusInLeadsTable1767521544473
  implements MigrationInterface
{
  name = "AddMeetingScheduledStatusInLeadsTable1767521544473";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`leads\` CHANGE \`status\` \`status\` enum ('New', 'Not Answered', 'Busy', 'Answered', 'Follow Up', 'Meeting Scheduled', 'Meeting Done', 'Agreement Pending', 'Agreement Done', 'Payment Pending', 'Payment Done', 'Completed', 'Documentation', 'Not Interested') NULL DEFAULT 'New'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`leads\` CHANGE \`status\` \`status\` enum ('New', 'Not Answered', 'Busy', 'Answered', 'Follow Up', 'Meeting Done', 'Agreement Pending', 'Agreement Done', 'Payment Pending', 'Payment Done', 'Completed', 'Documentation', 'Not Interested') NULL DEFAULT 'New'`
    );
  }
}
