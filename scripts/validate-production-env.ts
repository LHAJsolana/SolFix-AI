const required = [
  "DATABASE_URL",
  "PERSISTENCE_MODE",
  "SOLANA_MAINNET_RPC_URL",
  "SOLANA_DEVNET_RPC_URL",
  "AI_PROVIDER"
] as const;

let failed = false;

for (const key of required) {
  const present = Boolean(process.env[key]);
  console.log(`${key}: ${present ? "present" : "missing"}`);
  if (!present) failed = true;
}

if (process.env.PERSISTENCE_MODE && process.env.PERSISTENCE_MODE !== "postgres") {
  console.log("PERSISTENCE_MODE: invalid mode");
  failed = true;
}

if (process.env.AI_PROVIDER && process.env.AI_PROVIDER !== "deterministic") {
  console.log("AI_PROVIDER: non-deterministic provider configured");
}

process.exit(failed ? 1 : 0);

export {};
