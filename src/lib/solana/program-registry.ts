const knownPrograms: Record<string, string> = {
  "11111111111111111111111111111111": "System Program",
  ComputeBudget111111111111111111111111111111: "Compute Budget Program",
  ATokenGPvoterUgjgdrjtJ9Go5AwPxq3dE9B4Q4tZ2E: "Associated Token Program",
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: "Associated Token Program",
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "SPL Token Program",
  TokenzQdBNbLqP5VEhdkAS6EPF58ByxUQnYu9mPXxQ: "Token-2022 Program",
  MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr: "Memo Program",
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s": "Metaplex Token Metadata",
  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4": "Jupiter Aggregator"
};

export function getProgramName(programId?: string) {
  if (!programId) return "Unknown Program";
  return knownPrograms[programId] ?? "Unknown Program";
}

export function getProgramRegistry() {
  return knownPrograms;
}
