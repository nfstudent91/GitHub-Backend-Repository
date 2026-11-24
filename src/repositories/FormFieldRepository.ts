import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { FormField } from "../entities/FormField";

export class FormFieldRepository {
    private repository: Repository<FormField>;

    constructor() {
        this.repository = AppDataSource.getRepository(FormField);
    }

    async findByFormId(formId: number): Promise<FormField[]> {
        return await this.repository.find({
            where: { formId },
            relations: ["options"],
            order: {
                orderIndex: "ASC",
                options: {
                    orderIndex: "ASC"
                }
            }
        });
    }

    async findById(id: number): Promise<FormField | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ["options", "form"],
            order: {
                options: {
                    orderIndex: "ASC"
                }
            }
        });
    }

    async create(fieldData: Partial<FormField>): Promise<FormField> {
        const field = this.repository.create(fieldData);
        return await this.repository.save(field);
    }

    async update(id: number, fieldData: Partial<FormField>): Promise<FormField | null> {
        await this.repository.update(id, fieldData);
        return await this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
}
