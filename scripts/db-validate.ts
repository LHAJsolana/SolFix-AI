import { spawnSync } from "node:child_process";

process.env.DATABASE_URL ||= "postgresql://user:password@localhost:5432/solfix_validate";

const command = process.platform === "win32" ? "cmd.exe" : "npx";
const args = process.platform === "win32" ? ["/c", "npx", "prisma", "validate"] : ["prisma", "validate"];
const result = spawnSync(command, args, { stdio: "inherit", env: process.env });

process.exit(result.status ?? 1);
