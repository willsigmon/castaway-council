import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // In build time, return a placeholder string to allow build to succeed
    // Runtime will throw proper error when DB is actually accessed
    if (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV) {
      return "postgresql://placeholder:placeholder@localhost:5432/placeholder";
    }
    throw new Error("DATABASE_URL is not set. Please configure your environment variables.");
  }
  return connectionString;
}

function initializeDb() {
  if (!dbInstance) {
    try {
      const connectionString = getConnectionString();
      // Skip connection during build if placeholder URL
      if (connectionString.includes("placeholder")) {
        // Return a mock db instance for build time
        return {} as ReturnType<typeof drizzle>;
      }
      // Use connection pooling for serverless (Vercel)
      const client = postgres(connectionString, {
        max: 1, // Serverless-friendly: 1 connection per function
        idle_timeout: 20,
        connect_timeout: 10,
      });
      dbInstance = drizzle(client, { schema });
    } catch (error) {
      // During build, return empty object to allow build to succeed
      if (process.env.NEXT_PHASE === "phase-production-build") {
        return {} as ReturnType<typeof drizzle>;
      }
      throw error;
    }
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
