const { config } = require("dotenv");
const { spawnSync } = require("child_process");

config();

const url = process.env.DATABASE_URL || "";

if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  shell: process.platform === "win32",
  encoding: "utf8",
});

const stdout = result.stdout || "";
const stderr = result.stderr || "";

if (stdout) process.stdout.write(stdout);
if (stderr) process.stderr.write(stderr);

// If DB is already initialized outside Prisma migrations, allow build to continue.
if ((result.status ?? 1) !== 0 && /P3005|database schema is not empty/i.test(`${stdout}\n${stderr}`)) {
  console.warn("Skipping prisma migrate deploy: existing non-empty schema detected (P3005).");
  process.exit(0);
}

process.exit(result.status ?? 1);
