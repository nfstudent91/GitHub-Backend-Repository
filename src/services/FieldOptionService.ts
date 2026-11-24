import { FieldOptionRepository } from "../repositories/FieldOptionRepository";
import { FormFieldRepository } from "../repositories/FormFieldRepository";
import { FieldOption } from "../entities/FieldOption";

export class FieldOptionService {
    private fieldOptionRepository: FieldOptionRepository;
    private formFieldRepository: FormFieldRepository;

    constructor() {
        this.fieldOptionRepository = new FieldOptionRepository();
        this.formFieldRepository = new FormFieldRepository();
    }

    async getOptionsByFieldId(fieldId: number): Promise<FieldOption[]> {
        // Check if field exists
        const field = await this.formFieldRepository.findById(fieldId);
        if (!field) {
            throw new Error("Form field not found");
        }

        return await this.fieldOptionRepository.findByFieldId(fieldId);
    }

    async getOptionById(id: number): Promise<FieldOption> {
        const option = await this.fieldOptionRepository.findById(id);
        if (!option) {
            throw new Error("Field option not found");
        }
        return option;
    }

    async createOption(optionData: Partial<FieldOption>): Promise<FieldOption> {
        // Validate required fields
        if (!optionData.fieldId) {
            throw new Error("Field ID is required");
        }
        if (!optionData.label) {
            throw new Error("Option label is required");
        }
        if (!optionData.value) {
            throw new Error("Option value is required");
        }

        // Check if field exists
        const field = await this.formFieldRepository.findById(optionData.fieldId);
        if (!field) {
            throw new Error("Form field not found");
        }

        return await this.fieldOptionRepository.create(optionData);
    }

    async updateOption(id: number, optionData: Partial<FieldOption>): Promise<FieldOption> {
        // Check if option exists
        await this.getOptionById(id);

        const updatedOption = await this.fieldOptionRepository.update(id, optionData);
        if (!updatedOption) {
            throw new Error("Error updating field option");
        }
        return updatedOption;
    }

    async deleteOption(id: number): Promise<boolean> {
        // Check if option exists
        await this.getOptionById(id);

        return await this.fieldOptionRepository.delete(id);
    }
}
