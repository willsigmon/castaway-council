import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Use connection pooling for serverless (Vercel)
const client = postgres(connectionString, {
  max: 1, // Serverless-friendly: 1 connection per function
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
