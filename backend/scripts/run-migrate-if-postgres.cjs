const { config } = require("dotenv");
const { spawnSync } = require("child_process");

config();

const url = process.env.DATABASE_URL || "";

if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
