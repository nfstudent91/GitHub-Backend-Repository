import { StageRepository } from "../repositories/stage.repository";
import { Stage } from "../entities/Stage";

export class StageService {
  private stageRepository: StageRepository;

  constructor() {
    this.stageRepository = new StageRepository();
  }

  async getAllStages(): Promise<Stage[]> {
    return await this.stageRepository.findAll();
  }

  async getStageById(id: number): Promise<Stage | null> {
    const stage = await this.stageRepository.findById(id);
    if (!stage) {
      throw new Error("Stage not found");
    }
    return stage;
  }

  async createStage(stageData: Partial<Stage>): Promise<Stage> {
    // Business logic: Check if stage with same name already exists
    const existingStage = await this.stageRepository.findByName(stageData.name!);
    if (existingStage) {
      throw new Error("Stage with this name already exists");
    }

    // Validate required fields
    if (!stageData.name || stageData.name.trim() === "") {
      throw new Error("Stage name is required");
    }

    return await this.stageRepository.create(stageData);
  }

  async updateStage(id: number, stageData: Partial<Stage>): Promise<Stage | null> {
    // Check if stage exists
    const existingStage = await this.stageRepository.findById(id);
    if (!existingStage) {
      throw new Error("Stage not found");
    }

    // If updating name, check for duplicates
    if (stageData.name && stageData.name !== existingStage.name) {
      const duplicateStage = await this.stageRepository.findByName(stageData.name);
      if (duplicateStage) {
        throw new Error("Stage with this name already exists");
      }
    }

    return await this.stageRepository.update(id, stageData);
  }

  async deleteStage(id: number): Promise<boolean> {
    // Check if stage exists
    const existingStage = await this.stageRepository.findById(id);
    if (!existingStage) {
      throw new Error("Stage not found");
    }

    // Business logic: Check if stage has any active leads
    if (existingStage.leads && existingStage.leads.length > 0) {
      throw new Error("Cannot delete stage with active leads. Please move leads to another stage first.");
    }

    return await this.stageRepository.delete(id);
  }

  async getStageCount(): Promise<number> {
    return await this.stageRepository.count();
  }
}

