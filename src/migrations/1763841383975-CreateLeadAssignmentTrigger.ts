import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLeadAssignmentTrigger1763841383975 implements MigrationInterface {
    name = 'CreateLeadAssignmentTrigger1763841383975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create trigger that inserts into lead_history after insert on lead_assignments
        await queryRunner.query(`
            CREATE TRIGGER \`trg_lead_assignment_insert_history\`
            AFTER INSERT ON \`lead_assignments\`
            FOR EACH ROW
            BEGIN
                INSERT INTO \`lead_history\` (
                    \`lead_id\`,
                    \`assigned_to\`,
                    \`assigned_by\`,
                    \`createdAt\`,
                    \`updatedAt\`
                )
                VALUES (
                    NEW.\`lead_id\`,
                    NEW.\`assigned_to\`,
                    NEW.\`assigned_by\`,
                    NOW(6),
                    NOW(6)
                );
            END
        `);

        // Create trigger that inserts into lead_history after update on lead_assignments
        await queryRunner.query(`
            CREATE TRIGGER \`trg_lead_assignment_update_history\`
            AFTER UPDATE ON \`lead_assignments\`
            FOR EACH ROW
            BEGIN
                INSERT INTO \`lead_history\` (
                    \`lead_id\`,
                    \`assigned_to\`,
                    \`assigned_by\`,
                    \`createdAt\`,
                    \`updatedAt\`
                )
                VALUES (
                    NEW.\`lead_id\`,
                    NEW.\`assigned_to\`,
                    NEW.\`assigned_by\`,
                    NOW(6),
                    NOW(6)
                );
            END
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the triggers
        await queryRunner.query(`DROP TRIGGER IF EXISTS \`trg_lead_assignment_update_history\``);
        await queryRunner.query(`DROP TRIGGER IF EXISTS \`trg_lead_assignment_insert_history\``);
    }
}

