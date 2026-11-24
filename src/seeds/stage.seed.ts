import { AppDataSource } from "../config/database";
import { Stage } from "../entities/Stage";

export async function seedStages() {
  const stageRepository = AppDataSource.getRepository(Stage);

  const stages = [
    { name: "Cold", isActive: true, createdBy: "system" },
    { name: "Hot", isActive: true, createdBy: "system" },
    { name: "Dead", isActive: true, createdBy: "system" },
  ];

  console.log("📝 Seeding Stages...");

  for (const stageData of stages) {
    const existingStage = await stageRepository.findOne({
      where: { name: stageData.name },
    });

    if (!existingStage) {
      const stage = stageRepository.create(stageData);
      await stageRepository.save(stage);
      console.log(`  ✓ Created stage: ${stageData.name}`);
    } else {
      console.log(`  ⊘ Stage already exists: ${stageData.name}`);
    }
  }

  console.log("✅ Stages seeding completed\n");
}

