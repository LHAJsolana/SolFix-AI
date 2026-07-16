import type { Network, NormalizedTransaction } from "../types";
import { createConnection, withTimeout } from "./rpc-client";
import { normalizeTransaction } from "./transaction-normalizer";

const lookupCache = new Map<string, { expiresAt: number; transaction: NormalizedTransaction }>();
const LOOKUP_CACHE_MS = 20_000;

export async function fetchNormalizedTransaction(signature: string, network: Network): Promise<NormalizedTransaction> {
  const key = `${network}:${signature}`;
  const cached = lookupCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.transaction;

  const connection = createConnection(network);
  const tx = await withTimeout(
    connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed"
    }),
    12_000,
    `${network} transaction fetch`
  );
  const normalized = {
    ...normalizeTransaction(signature, network, tx),
    retrievedAt: new Date().toISOString()
  };
  lookupCache.set(key, { expiresAt: Date.now() + LOOKUP_CACHE_MS, transaction: normalized });
  return normalized;
}
