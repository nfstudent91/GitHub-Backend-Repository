import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMoreColumnInLeadsTable1767115646937
  implements MigrationInterface
{
  name = "AddMoreColumnInLeadsTable1767115646937";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`visaCategory\` varchar(100) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`country\` varchar(100) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE \`leads\` ADD \`targetCountry\` varchar(100) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`leads\` DROP COLUMN \`targetCountry\``
    );
    await queryRunner.query(`ALTER TABLE \`leads\` DROP COLUMN \`country\``);
    await queryRunner.query(
      `ALTER TABLE \`leads\` DROP COLUMN \`visaCategory\``
    );
  }
}
