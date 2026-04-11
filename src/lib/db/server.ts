import { Pool, type PoolClient, type QueryResult } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __vasirono_pg_pool__: Pool | undefined;
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }

  return url;
}

function createPool() {
  return new Pool({
    connectionString: getDatabaseUrl(),
    max: Number(process.env.PG_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
}

export const db =
  global.__vasirono_pg_pool__ ?? createPool();

if (process.env.NODE_ENV !== "production") {
  global.__vasirono_pg_pool__ = db;
}

export async function query<T = unknown>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  return db.query<T>(text, params);
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}