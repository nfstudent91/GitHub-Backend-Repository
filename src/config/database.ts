import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

// Validate mandatory environment variables
const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`
    );
  }

  return value;
};

// SSL is controlled by DB_SSL, not NODE_ENV.
// Local MySQL: DB_SSL=false
// Azure MySQL: DB_SSL=true
const sslEnabled = process.env.DB_SSL === "true";

let sslConfig: {
  ca: string;
  rejectUnauthorized: boolean;
} | undefined;

if (sslEnabled) {
  const caPath = path.resolve(
    process.cwd(),
    process.env.DB_SSL_CA_PATH ||
      "certs/combined-ca-certificates.pem"
  );

  if (!fs.existsSync(caPath)) {
    throw new Error(
      `MySQL SSL certificate not found: ${caPath}`
    );
  }

  sslConfig = {
    ca: fs.readFileSync(caPath, "utf8"),
    rejectUnauthorized: true,
  };

  console.log("🔐 MySQL SSL enabled with CA certificate");
} else {
  console.log("ℹ️ MySQL SSL disabled (local connection)");
}

// TypeORM database configuration
export const AppDataSource = new DataSource({
  type: "mysql",

  host: requiredEnv("DB_HOST"),
  port: Number(process.env.DB_PORT || 3306),

  username: requiredEnv("DB_USERNAME"),
  password: requiredEnv("DB_PASSWORD"),
  database: requiredEnv("DB_DATABASE"),

  ssl: sslConfig,

  synchronize: false,
  logging: process.env.NODE_ENV === "development",

  entities: [
    path.join(__dirname, "../entities/**/*.{ts,js}"),
  ],

  migrations: [
    path.join(__dirname, "../migrations/**/*.{ts,js}"),
  ],

  subscribers: [],

  timezone: "Z",
});

// Initialize database connection
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();

    console.log("✅ Database connection established successfully");
    console.log(`📡 Connected database: ${process.env.DB_DATABASE}`);
  } catch (error) {
    console.error(
      "❌ Error during database initialization:",
      error
    );

    throw error;
  }
};