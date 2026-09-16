import { defineConfig } from 'drizzle-kit';

/**
 * PRD §37 specifies PostgreSQL + pgvector. This prototype targets libSQL
 * (SQLite dialect) so the whole system runs with `npm run setup` and no
 * external services. See docs/DEVIATIONS.md §1 — the schema, repositories,
 * and services are dialect-agnostic; only this file and src/lib/db/client.ts
 * change when moving to Postgres.
 *
 * drizzle-kit needs the `turso` dialect (not `sqlite`) to talk to a remote
 * libsql:// database over HTTP — `sqlite` assumes a local file/driver and
 * hangs indefinitely against a remote URL.
 */
const url = process.env.DATABASE_URL ?? 'file:./data/accessai.db';
const isRemote = url.startsWith('libsql:') || url.startsWith('https:');

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: isRemote ? 'turso' : 'sqlite',
  dbCredentials: isRemote
    ? { url, authToken: process.env.DATABASE_AUTH_TOKEN }
    : { url },
  verbose: true,
  strict: true,
});
