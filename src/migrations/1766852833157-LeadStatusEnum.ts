import { MigrationInterface, QueryRunner } from "typeorm";

export class LeadStatusEnum1766852833157 implements MigrationInterface {
  name = "LeadStatusEnum1766852833157";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`leads\` CHANGE \`status\` \`status\` enum ('New', 'Not Answered', 'Busy', 'Answered', 'Follow Up', 'Meeting Done', 'Agreement Pending', 'Agreement Done', 'Payment Pending', 'Payment Done', 'Completed', 'Documentation') NULL DEFAULT 'New'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`leads\` CHANGE \`status\` \`status\` enum ('New', 'Not Answered', 'Busy', 'Answered', 'Follow Up', 'Meeting Done', 'Agreement Pending', 'Agreement Done', 'Payment Pending', 'Payment Done', 'Completed', 'Dead') NULL DEFAULT 'New'`
    );
  }
}
