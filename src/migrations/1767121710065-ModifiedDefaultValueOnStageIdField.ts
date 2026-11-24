import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedDefaultValueOnStageIdField1767121710065
  implements MigrationInterface
{
  name = "ModifiedDefaultValueOnStageIdField1767121710065";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`leads\` CHANGE \`stageId\` \`stageId\` int NULL DEFAULT '9'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`leads\` CHANGE \`stageId\` \`stageId\` int NULL DEFAULT '1'`
    );
  }
}
