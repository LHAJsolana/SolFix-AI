import { Connection } from "@solana/web3.js";
import type { Network } from "../types";

export function getRpcUrl(network: Network) {
  if (network === "mainnet-beta") {
    return process.env.SOLANA_MAINNET_RPC_URL || "https://api.mainnet-beta.solana.com";
  }
  return process.env.SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com";
}

export function createConnection(network: Network) {
  return new Connection(getRpcUrl(network), {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 12_000
  });
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms.`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function checkRpcHealth(network: Network) {
  const connection = createConnection(network);
  try {
    const epoch = await withTimeout(connection.getEpochInfo("confirmed"), 4000, `${network} RPC health check`);
    return { ok: true, blockHeight: epoch.blockHeight };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "RPC health check failed." };
  }
}
