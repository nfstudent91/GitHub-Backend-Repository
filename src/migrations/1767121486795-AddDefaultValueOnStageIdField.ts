import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultValueOnStageIdField1767121486795
  implements MigrationInterface
{
  name = "AddDefaultValueOnStageIdField1767121486795";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`leads\` CHANGE \`stageId\` \`stageId\` int NULL DEFAULT '1'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`leads\` CHANGE \`stageId\` \`stageId\` int NULL`
    );
  }
}
