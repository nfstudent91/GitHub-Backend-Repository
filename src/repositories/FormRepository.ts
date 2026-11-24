import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Form } from "../entities/Form";

export class FormRepository {
    private repository: Repository<Form>;

    constructor() {
        this.repository = AppDataSource.getRepository(Form);
    }

    async findAllPaginated(
        page: number = 1,
        limit: number = 10,
        search?: string,
        isActive: boolean = true
    ): Promise<{ data: Form[]; total: number; page: number; limit: number; totalPages: number }> {
        const skip = (page - 1) * limit;

        const queryBuilder = this.repository.createQueryBuilder("form")
            .where("form.isActive = :isActive", { isActive });

        if (search && search.trim() !== "") {
            const searchTerm = `%${search.trim()}%`;
            queryBuilder.andWhere(
                "(form.name LIKE :search OR form.description LIKE :search)",
                { search: searchTerm }
            );
        }

        const total = await queryBuilder.getCount();

        const data = await queryBuilder
            .orderBy("form.createdAt", "DESC")
            .skip(skip)
            .take(limit)
            .getMany();

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findById(id: number): Promise<Form | null> {
        return await this.repository.findOne({
            where: { id, isActive: true },
            relations: ["fields", "fields.options"],
            order: {
                fields: {
                    orderIndex: "ASC",
                    options: {
                        orderIndex: "ASC"
                    }
                }
            }
        });
    }

    async create(formData: Partial<Form>): Promise<Form> {
        const form = this.repository.create(formData);
        return await this.repository.save(form);
    }

    async update(id: number, formData: Partial<Form>): Promise<Form | null> {
        await this.repository.update(id, formData);
        return await this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.update(id, { isActive: false });
        return result.affected ? result.affected > 0 : false;
    }
}
