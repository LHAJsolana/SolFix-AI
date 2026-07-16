import type { Network } from "../types";

export function explorerTxUrl(signature: string, network: Network) {
  const cluster = network === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}
