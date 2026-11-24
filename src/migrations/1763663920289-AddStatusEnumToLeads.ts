import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusEnumToLeads1763663920289 implements MigrationInterface {
    name = 'AddStatusEnumToLeads1763663920289'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`leads\` ADD \`status\` enum ('hot', 'cold', 'dead') NULL DEFAULT 'cold'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`status\``);
    }

}
