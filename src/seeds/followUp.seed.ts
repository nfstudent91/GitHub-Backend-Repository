import { AppDataSource } from "../config/database";
import { FollowUp } from "../entities/FollowUp";

export async function seedFollowUps() {
  const followUpRepository = AppDataSource.getRepository(FollowUp);

  const followUps = [
    { name: "Call", isActive: true, createdBy: "system" },
    { name: "WhatsApp", isActive: true, createdBy: "system" },
    { name: "Email", isActive: true, createdBy: "system" },
  ];

  console.log("📝 Seeding Follow-Up Types...");

  for (const followUpData of followUps) {
    const existingFollowUp = await followUpRepository.findOne({
      where: { name: followUpData.name },
    });

    if (!existingFollowUp) {
      const followUp = followUpRepository.create(followUpData);
      await followUpRepository.save(followUp);
      console.log(`  ✓ Created follow-up type: ${followUpData.name}`);
    } else {
      console.log(`  ⊘ Follow-up type already exists: ${followUpData.name}`);
    }
  }

  console.log("✅ Follow-Up Types seeding completed\n");
}

