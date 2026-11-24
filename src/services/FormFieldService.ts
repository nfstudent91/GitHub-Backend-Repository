import { FormFieldRepository } from "../repositories/FormFieldRepository";
import { FormRepository } from "../repositories/FormRepository";
import { FormField } from "../entities/FormField";

export class FormFieldService {
    private formFieldRepository: FormFieldRepository;
    private formRepository: FormRepository;

    constructor() {
        this.formFieldRepository = new FormFieldRepository();
        this.formRepository = new FormRepository();
    }

    async getFieldsByFormId(formId: number): Promise<FormField[]> {
        // Check if form exists
        const form = await this.formRepository.findById(formId);
        if (!form) {
            throw new Error("Form not found");
        }

        return await this.formFieldRepository.findByFormId(formId);
    }

    async getFieldById(id: number): Promise<FormField> {
        const field = await this.formFieldRepository.findById(id);
        if (!field) {
            throw new Error("Form field not found");
        }
        return field;
    }

    async createField(fieldData: Partial<FormField>): Promise<FormField> {
        // Validate required fields
        if (!fieldData.formId) {
            throw new Error("Form ID is required");
        }
        if (!fieldData.fieldName) {
            throw new Error("Field name is required");
        }
        if (!fieldData.fieldLabel) {
            throw new Error("Field label is required");
        }
        if (!fieldData.fieldType) {
            throw new Error("Field type is required");
        }

        // Check if form exists
        const form = await this.formRepository.findById(fieldData.formId);
        if (!form) {
            throw new Error("Form not found");
        }

        return await this.formFieldRepository.create(fieldData);
    }

    async updateField(id: number, fieldData: Partial<FormField>): Promise<FormField> {
        // Check if field exists
        await this.getFieldById(id);

        const updatedField = await this.formFieldRepository.update(id, fieldData);
        if (!updatedField) {
            throw new Error("Error updating form field");
        }
        return updatedField;
    }

    async deleteField(id: number): Promise<boolean> {
        // Check if field exists
        await this.getFieldById(id);

        return await this.formFieldRepository.delete(id);
    }
}
