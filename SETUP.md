# Quick Setup Guide

This guide will help you set up the Node.js CRM system from scratch.

## Step-by-Step Setup

### 1. Prerequisites Check

Ensure you have the following installed:

```bash
# Check Node.js version (should be v16+)
node --version

# Check if Yarn is installed
yarn --version

# Check if MySQL is running
mysql --version
```

If any of these are missing, install them first.

### 2. Install Dependencies

```bash
yarn install
```

### 3. Configure Database

Open the `.env` file and update with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=nodejs_crm
```

### 4. Create Database

Open MySQL and create the database:

```bash
mysql -u root -p
```

Then in MySQL:

```sql
CREATE DATABASE nodejs_crm;
EXIT;
```

### 5. Run Migrations

This will create all the tables:

```bash
yarn migration:run
```

Expected output:
```
✅ Database connection established successfully
Migration InitialMigration1699999999999 has been executed successfully.
```

### 6. Seed Initial Data

This will populate the database with initial data:

```bash
yarn seed
```

Expected output:
```
🌱 Starting database seeding...
✅ Database connection established

📝 Seeding Roles...
  ✓ Created role: Admin
  ✓ Created role: Manager
  ✓ Created role: Sales Agent
  ✓ Created role: Advisor
✅ Roles seeding completed

📝 Seeding Stages...
  ✓ Created stage: New
  ✓ Created stage: Set
  ... (and more)
✅ Stages seeding completed

📝 Seeding Follow-Up Types...
  ✓ Created follow-up type: Call
  ✓ Created follow-up type: WhatsApp
  ✓ Created follow-up type: Email
✅ Follow-Up Types seeding completed

📝 Seeding Users...
  ✓ Created user: admin
✅ Users seeding completed

🎉 Database seeding completed successfully!
```

### 7. Start Development Server

```bash
yarn dev
```

Expected output:
```
✅ Database connection established successfully
🚀 Server is running on http://localhost:3000
📊 Environment: development
```

### 8. Test the API

Open your browser or use curl:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "CRM API is running"
}
```

## Troubleshooting

### Database Connection Error

If you see:
```
❌ Error during database initialization: Access denied for user 'root'@'localhost'
```

**Solution:** Check your database credentials in the `.env` file.

### Migration Already Run

If you see:
```
Migration InitialMigration1699999999999 has already been executed.
```

**Solution:** This is normal. The migration has already been applied. No action needed.

### Port Already in Use

If you see:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:** Either:
1. Stop the process using port 3000
2. Or change the `PORT` in your `.env` file

## Next Steps

After successful setup:

1. Change the default admin password
2. Create additional users via the API (to be implemented)
3. Start creating leads and managing your CRM data
4. Build your custom API endpoints for your specific needs

## Database Management

### View Tables

```bash
mysql -u root -p nodejs_crm
```

```sql
SHOW TABLES;
DESCRIBE users;
SELECT * FROM roles;
```

### Reset Database (if needed)

⚠️ **Warning:** This will delete all data!

```bash
yarn migration:revert
yarn migration:run
yarn seed
```

## Support

For issues or questions, please refer to the main README.md file.

