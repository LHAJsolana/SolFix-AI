import { NextResponse } from "next/server";
import { safePersistenceStatus } from "@/lib/database/persistence-mode";
import { checkRpcHealth } from "@/lib/solana/rpc-client";

export async function GET() {
  const [mainnet, devnet] = await Promise.all([checkRpcHealth("mainnet-beta"), checkRpcHealth("devnet")]);
  const persistence = safePersistenceStatus();
  return NextResponse.json({
    status: mainnet.ok || devnet.ok ? "ok" : "degraded",
    persistence: {
      mode: persistence.mode,
      configured: persistence.configured,
      available: persistence.configured,
      error: persistence.error
    },
    rpc: {
      mainnet: { mode: Boolean(process.env.SOLANA_MAINNET_RPC_URL) ? "configured" : "public_default", ...mainnet },
      devnet: { mode: Boolean(process.env.SOLANA_DEVNET_RPC_URL) ? "configured" : "public_default", ...devnet }
    },
    aiProvider: process.env.ENABLE_AI_EXPLANATIONS === "true" ? process.env.AI_PROVIDER || "deterministic" : "deterministic_disabled",
    rateLimit: "process_memory_only",
    examples: "available_optional",
    walletAttestation: process.env.ENABLE_WALLET_ATTESTATION !== "false",
    simulation: "serialized_transaction_supported"
  });
}
