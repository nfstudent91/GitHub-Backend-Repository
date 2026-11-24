import { FollowUpRepository } from "../repositories/followUp.repository";
import { FollowUp } from "../entities/FollowUp";

export class FollowUpService {
  private followUpRepository: FollowUpRepository;

  constructor() {
    this.followUpRepository = new FollowUpRepository();
  }

  async getAllFollowUps(): Promise<FollowUp[]> {
    return await this.followUpRepository.findAll();
  }

  async getFollowUpById(id: number): Promise<FollowUp | null> {
    const followUp = await this.followUpRepository.findById(id);
    if (!followUp) {
      throw new Error("Follow-up type not found");
    }
    return followUp;
  }

  async createFollowUp(followUpData: Partial<FollowUp>): Promise<FollowUp> {
    // Business logic: Check if follow-up type with same name already exists
    const existingFollowUp = await this.followUpRepository.findByName(followUpData.name!);
    if (existingFollowUp) {
      throw new Error("Follow-up type with this name already exists");
    }

    // Validate required fields
    if (!followUpData.name || followUpData.name.trim() === "") {
      throw new Error("Follow-up type name is required");
    }

    return await this.followUpRepository.create(followUpData);
  }

  async updateFollowUp(id: number, followUpData: Partial<FollowUp>): Promise<FollowUp | null> {
    // Check if follow-up type exists
    const existingFollowUp = await this.followUpRepository.findById(id);
    if (!existingFollowUp) {
      throw new Error("Follow-up type not found");
    }

    // If updating name, check for duplicates
    if (followUpData.name && followUpData.name !== existingFollowUp.name) {
      const duplicateFollowUp = await this.followUpRepository.findByName(followUpData.name);
      if (duplicateFollowUp) {
        throw new Error("Follow-up type with this name already exists");
      }
    }

    return await this.followUpRepository.update(id, followUpData);
  }

  async deleteFollowUp(id: number): Promise<boolean> {
    // Check if follow-up type exists
    const existingFollowUp = await this.followUpRepository.findById(id);
    if (!existingFollowUp) {
      throw new Error("Follow-up type not found");
    }

    // Business logic: Check if follow-up type has any lead attempts
    if (existingFollowUp.leadAttempts && existingFollowUp.leadAttempts.length > 0) {
      throw new Error("Cannot delete follow-up type with existing lead attempts.");
    }

    return await this.followUpRepository.delete(id);
  }

  async getFollowUpCount(): Promise<number> {
    return await this.followUpRepository.count();
  }

  async findByName(name:string): Promise<any> {
    return await this.followUpRepository.findByName(name);
  }
}

