import { AppDataSource } from "../config/database";
import { MetaForm } from "../entities/MetaForm";

export class MetaFormRepository {
    private repository = AppDataSource.getRepository(MetaForm);

    async findByFormId(formId: string): Promise<MetaForm | null> {
        return await this.repository.findOne({ where: { formId } });
    }

    async create(data: Partial<MetaForm>): Promise<MetaForm> {
        const metaForm = this.repository.create(data);
        return await this.repository.save(metaForm);
    }
}
