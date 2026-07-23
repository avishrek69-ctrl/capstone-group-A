import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export const getPoolConfig = () => {
  const connectionString = process.env.DATABASE_URL;
  const isProduction = process.env.NODE_ENV === "production";
  const shouldUseSsl = isProduction || (connectionString || "").includes("render.com");

  return {
    connectionString,
    ...(shouldUseSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  };
};

const pool = new Pool(getPoolConfig());

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
