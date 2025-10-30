import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Please configure your environment variables.");
  }

  // Use connection pooling for serverless (Vercel)
  const client = postgres(connectionString, {
    max: 1, // Serverless-friendly: 1 connection per function
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(client, { schema });
}

// Lazy initialization - only connects when db is actually used
// This prevents build-time crashes if DATABASE_URL is not set
function getDb() {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}

// Create a proxy that lazily initializes the db on first property access
// This allows the module to load during build even without DATABASE_URL
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof typeof instance];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
