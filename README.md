# Node.js CRM System

A CRM (Customer Relationship Management) system built with Node.js, TypeORM, and MySQL.

## Features

- 🔐 JWT Authentication & Authorization
- 👥 User management with role-based access control (RBAC)
- 🔑 Secure password hashing with bcrypt
- 📊 Lead management and tracking
- 📈 Lead stages workflow (New → Set → Advisor → Meeting Done → Follow Up → Agreement Sign → Payment Received → Closed)
- 📞 Follow-up tracking (Call, WhatsApp, Email)
- 📝 Lead assignment and history tracking
- 🗄️ MySQL database with TypeORM
- 🌱 Database seeding for initial data
- 🔄 Migration support
- 👑 Admin-only routes protection

## Database Schema

The system includes the following tables:

1. **roles** - User roles (Admin, Manager, Sales Agent, Advisor)
2. **users** - System users with role-based permissions
3. **leads** - Lead information including contact details and application data
4. **stages** - Lead pipeline stages (8 predefined stages)
5. **followUp** - Follow-up types (Call, WhatsApp, Email)
6. **lead_assignments** - Lead assignment tracking
7. **lead_history** - Historical record of lead assignments
8. **lead_attempt** - Follow-up attempt records

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- MySQL (v8.0 or higher)

## Installation

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure environment variables

Edit the `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=nodejs_crm

PORT=3000
NODE_ENV=development
```

### 3. Create MySQL database

```sql
CREATE DATABASE nodejs_crm;
```

### 4. Run migrations

```bash
yarn migration:run
```

This will create all the necessary tables in your database.

### 5. Seed the database

```bash
yarn seed
```

This will populate the database with:
- 4 default roles (Admin, Manager, Sales Agent, Advisor)
- 8 lead stages (New, Set, Advisor, Meeting Done, followUp, Agreement Sign, PaymentReceived, Closed)
- 3 follow-up types (Call, WhatsApp, Email)
- 1 default admin user (username: `admin`, password: `admin123`)

⚠️ **Important:** Change the default admin password in production!

## Development

Start the development server with hot reload:

```bash
yarn dev
```

The server will start on `http://localhost:3000`

## Build

Compile TypeScript to JavaScript:

```bash
yarn build
```

## Production

Run the production server:

```bash
yarn start
```

## Database Commands

### Generate Migration

```bash
yarn typeorm migration:generate src/migrations/MigrationName -d src/config/database.ts
```

### Run Migrations

```bash
yarn migration:run
```

### Revert Migration

```bash
yarn migration:revert
```

### Create Seed Data

```bash
yarn seed
```

## Project Structure

```
nodejs-crm/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── entities/                 # TypeORM entities
│   │   ├── Role.ts
│   │   ├── User.ts
│   │   ├── Lead.ts
│   │   ├── Stage.ts
│   │   ├── FollowUp.ts
│   │   ├── LeadAssignment.ts
│   │   ├── LeadHistory.ts
│   │   ├── LeadAttempt.ts
│   │   └── index.ts
│   ├── migrations/               # Database migrations
│   │   └── 1699999999999-InitialMigration.ts
│   ├── seeds/                    # Database seed files
│   │   ├── index.ts
│   │   ├── role.seed.ts
│   │   ├── stage.seed.ts
│   │   ├── followUp.seed.ts
│   │   └── user.seed.ts
│   └── index.ts                  # Application entry point
├── dist/                         # Compiled JavaScript
├── .env                          # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### Public Endpoints
- `GET /health` - Health check endpoint
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Protected Endpoints (Authenticated)
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/change-password` - Change password

### Admin-Only Endpoints
All role, stage, and follow-up management endpoints require Admin role:
- All `/api/roles` endpoints
- All `/api/stages` endpoints
- All `/api/followups` endpoints

## Authentication

### Default Admin Credentials

After running the seed script, you can login with:

- **Username:** admin
- **Password:** admin123

⚠️ **IMPORTANT:** Change this password immediately in production!

### Quick Start

1. **Login to get JWT token:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

2. **Use token in requests:**
```bash
curl -X GET http://localhost:3000/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

See `AUTHENTICATION.md` for complete authentication documentation.

## Development Notes

### Entity Relationships

- **Users** belong to **Roles** (Many-to-One)
- **Leads** belong to **Stages** (Many-to-One)
- **LeadAssignments** track which user is assigned to which lead
- **LeadHistory** maintains a historical record of all lead assignments
- **LeadAttempts** track follow-up attempts with follow-up types

### Database Features

- Automatic timestamps (createdAt, updatedAt)
- Foreign key constraints
- Cascade deletes where appropriate
- Boolean flags for soft deletes (isActive)
- Created by tracking

## License

ISC

