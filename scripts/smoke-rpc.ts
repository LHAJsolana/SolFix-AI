import { fetchNormalizedTransaction } from "../src/lib/solana/transaction-fetcher";
import { validateSignature } from "../src/lib/validation";
import type { Network } from "../src/lib/types";

const inputs: Array<{ name: string; network: Network; signature?: string }> = [
  { name: "devnet failed", network: "devnet", signature: process.env.SMOKE_DEVNET_FAILED_SIGNATURE },
  { name: "devnet success", network: "devnet", signature: process.env.SMOKE_DEVNET_SUCCESS_SIGNATURE },
  { name: "mainnet failed", network: "mainnet-beta", signature: process.env.SMOKE_MAINNET_FAILED_SIGNATURE },
  { name: "mainnet success", network: "mainnet-beta", signature: process.env.SMOKE_MAINNET_SUCCESS_SIGNATURE }
];

async function main() {
  const configured = inputs.filter((input) => input.signature);
  if (configured.length === 0) {
    console.log("smoke:rpc skipped; no SMOKE_*_SIGNATURE values configured.");
    return;
  }

  for (const input of configured) {
    const parsed = validateSignature(input.signature ?? "");
    if (!parsed.success) throw new Error(`${input.name} signature is invalid.`);
    const tx = await fetchNormalizedTransaction(parsed.data, input.network);
    if (tx.status === "not_found") throw new Error(`${input.name} transaction was not found.`);
    console.log(`${input.name}: ${tx.status} ${tx.signature.slice(0, 8)}... slot=${tx.slot ?? "unknown"} instructions=${tx.instructions.length}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
