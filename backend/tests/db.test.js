import test from "node:test";
import assert from "node:assert/strict";
import { getPoolConfig } from "../src/db/index.js";

test("uses SSL in production", () => {
  process.env.NODE_ENV = "production";
  process.env.DATABASE_URL = "postgresql://user:password@dpg.example.com:5432/app";

  assert.deepEqual(getPoolConfig(), {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
});

test("does not force SSL for local development", () => {
  process.env.NODE_ENV = "development";
  process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/app";

  assert.deepEqual(getPoolConfig(), {
    connectionString: process.env.DATABASE_URL,
  });
});
