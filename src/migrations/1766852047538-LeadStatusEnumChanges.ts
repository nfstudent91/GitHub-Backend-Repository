import { MigrationInterface, QueryRunner } from "typeorm";

export class LeadStatusEnumChanges1766852047538 implements MigrationInterface {
    name = 'LeadStatusEnumChanges1766852047538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`status\` \`status\` enum ('New', 'Not Answered', 'Busy', 'Answered', 'Follow Up', 'Meeting Done', 'Agreement Pending', 'Agreement Done', 'Payment Pending', 'Payment Done', 'Completed', 'Dead') NULL DEFAULT 'New'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`status\` \`status\` enum ('hot', 'cold', 'dead') NULL DEFAULT 'cold'`);
    }

}
