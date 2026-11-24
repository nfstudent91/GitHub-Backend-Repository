import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { FieldOption } from "../entities/FieldOption";

export class FieldOptionRepository {
    private repository: Repository<FieldOption>;

    constructor() {
        this.repository = AppDataSource.getRepository(FieldOption);
    }

    async findByFieldId(fieldId: number): Promise<FieldOption[]> {
        return await this.repository.find({
            where: { fieldId },
            order: {
                orderIndex: "ASC"
            }
        });
    }

    async findById(id: number): Promise<FieldOption | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ["field"]
        });
    }

    async create(optionData: Partial<FieldOption>): Promise<FieldOption> {
        const option = this.repository.create(optionData);
        return await this.repository.save(option);
    }

    async update(id: number, optionData: Partial<FieldOption>): Promise<FieldOption | null> {
        await this.repository.update(id, optionData);
        return await this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
}
