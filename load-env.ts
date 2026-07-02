import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and configure your database URL.",
    );
  }

  return databaseUrl;
}
