require("reflect-metadata");

const { AppDataSource } = require("../dist/config/database");
const { spawnSync } = require("child_process");
const path = require("path");

async function main() {
  if (process.env.CONFIRM_DB_INIT !== "YES") {
    throw new Error("Set CONFIRM_DB_INIT=YES to initialize the database.");
  }

  console.log("Checking database connection...");
  await AppDataSource.initialize();

  console.log("Connected to:", AppDataSource.options.database);

  const migrations = await AppDataSource.showMigrations();

  if (migrations) {
    console.log("Running pending migrations...");
    await AppDataSource.runMigrations();
  } else {
    console.log("No pending migrations.");
  }

  await AppDataSource.destroy();

  console.log("Running database seeds...");

  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, "../dist/seeds/index.js")],
    { stdio: "inherit", env: process.env }
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error("Database seeding failed.");
  }

  console.log("Database initialization completed.");
}

main().catch(async (error) => {
  console.error(error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exitCode = 1;
});
