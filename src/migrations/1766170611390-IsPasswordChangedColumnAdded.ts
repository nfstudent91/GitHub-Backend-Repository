import { MigrationInterface, QueryRunner } from "typeorm";

export class IsPasswordChangedColumnAdded1766170611390
  implements MigrationInterface
{
  name = "IsPasswordChangedColumnAdded1766170611390";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`isPasswordChanged\` tinyint NOT NULL DEFAULT 0`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`isPasswordChanged\``
    );
  }
}
