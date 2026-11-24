# Migration Commands

Here are the migration commands for this project using `yarn`.

## Generate a Migration
Creates a new migration file based on schema changes.
```bash
yarn migration:generate src/migrations/MigrationName -d src/config/database.ts
```
*Replace `MigrationName` with a descriptive name (e.g., `CreateUsersTable`).*

## Run Migrations
Applies all pending migrations to the database.
```bash
yarn migration:run
```

## Revert Migration
Reverts the most recently executed migration.
```bash
yarn migration:revert
```
