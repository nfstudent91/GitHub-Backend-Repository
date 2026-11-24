import { MigrationInterface, QueryRunner } from "typeorm";

export class StatusRenameToStageId1763663478216 implements MigrationInterface {
    name = 'StatusRenameToStageId1763663478216'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`status\` \`stageId\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`stageId\` \`status\` int NULL`);
    }

}
