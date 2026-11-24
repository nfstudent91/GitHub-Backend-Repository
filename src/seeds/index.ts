import "reflect-metadata";
import { AppDataSource } from "../config/database";
import { seedRoles } from "./role.seed";
import { seedStages } from "./stage.seed";
import { seedFollowUps } from "./followUp.seed";
import { seedUsers } from "./user.seed";
// import { seedLeads } from "./lead.seed";

async function runSeeds() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Initialize database connection
    await AppDataSource.initialize();
    console.log("✅ Database connection established\n");

    // Run seeds in order (respecting foreign key dependencies)
    await seedRoles();
    await seedStages();
    await seedFollowUps();
    await seedUsers();
    // await seedLeads();

    console.log("\n🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

runSeeds();

