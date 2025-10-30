import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Please configure your environment variables.");
  }
  return connectionString;
}

function initializeDb() {
  if (!dbInstance) {
    const connectionString = getConnectionString();
    // Use connection pooling for serverless (Vercel)
    const client = postgres(connectionString, {
      max: 1, // Serverless-friendly: 1 connection per function
      idle_timeout: 20,
      connect_timeout: 10,
    });
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}

// Lazy initialization - only connects when db is actually used
// This prevents build-time crashes if DATABASE_URL is not set
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const db = initializeDb();
    const value = db[prop as keyof typeof db];
    return typeof value === "function" ? value.bind(db) : value;
  },
});
