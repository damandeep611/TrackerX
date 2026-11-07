import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as authSchema from "./schema/auth-schema";
import * as mainSchema from "./schema/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, {
  schema: {
    ...authSchema,
    ...mainSchema,
  },
});
