import { FormRepository } from "../repositories/FormRepository";
import { Form } from "../entities/Form";

export class FormService {
    private formRepository: FormRepository;

    constructor() {
        this.formRepository = new FormRepository();
    }

    async getAllForms(
        page: number = 1,
        limit: number = 10,
        search?: string,
        isActive: boolean = true
    ): Promise<{ data: Form[]; total: number; page: number; limit: number; totalPages: number }> {
        return await this.formRepository.findAllPaginated(page, limit, search, isActive);
    }

    async getFormById(id: number): Promise<Form> {
        const form = await this.formRepository.findById(id);
        if (!form) {
            throw new Error("Form not found");
        }
        return form;
    }

    async createForm(formData: Partial<Form>): Promise<Form> {
        // Validate required fields
        if (!formData.name) {
            throw new Error("Form name is required");
        }
        return await this.formRepository.create(formData);
    }

    async updateForm(id: number, formData: Partial<Form>): Promise<Form> {
        // Check if form exists
        await this.getFormById(id);

        const updatedForm = await this.formRepository.update(id, formData);
        if (!updatedForm) {
            throw new Error("Error updating form");
        }
        return updatedForm;
    }

    async deleteForm(id: number): Promise<boolean> {
        // Check if form exists
        await this.getFormById(id);

        return await this.formRepository.delete(id);
    }
}
