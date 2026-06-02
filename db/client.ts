import { drizzle } from "drizzle-orm/mysql2";
import mysql, { type Pool } from "mysql2/promise";
import * as schema from "./schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Global singleton — survives Next.js Fast Refresh / HMR
const globalForDb = globalThis as unknown as {
  pool?: Pool;
};

function createPool(): Pool {
  return mysql.createPool({
    uri: process.env.DATABASE_URL!,
    connectionLimit: Number(process.env.DB_POOL_SIZE) || 20, // default 20, tunable via env
    waitForConnections: true,
    queueLimit: 0, // unlimited queue
    idleTimeout: 60, // close idle connections after 60s
    maxIdle: 10, // keep max 10 idle connections ready
    enableKeepAlive: true,
    keepAliveInitialDelay: 30000,
    connectTimeout: 5000, // fail fast if can't connect
  });
}

const pool = globalForDb.pool ?? createPool();

// In development, attach to globalThis to survive Fast Refresh
if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });
