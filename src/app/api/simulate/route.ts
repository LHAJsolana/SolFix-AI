import { NextRequest, NextResponse } from "next/server";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { z } from "zod";
import { createConnection, withTimeout } from "@/lib/solana/rpc-client";
import { networkSchema } from "@/lib/validation";
import { clientKey, rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

const simulateSchema = z.object({
  network: networkSchema.default("devnet"),
  serializedTransaction: z.string().trim().min(20).max(20000).refine((value) => /^[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length % 4 === 0, "Serialized transaction must be valid base64."),
  encoding: z.enum(["base64"]).default("base64")
});

export function decodeTransaction(serialized: string) {
  const bytes = Buffer.from(serialized, "base64");
  if (bytes.length === 0 || bytes.toString("base64").replace(/=+$/, "") !== serialized.replace(/=+$/, "")) {
    throw new Error("Serialized transaction must be valid base64.");
  }
  if (bytes.length > 1500) {
    throw new Error("Serialized transaction is too large for safe simulation.");
  }
  try {
    return { kind: "legacy" as const, transaction: Transaction.from(bytes) };
  } catch {
    return { kind: "versioned" as const, transaction: VersionedTransaction.deserialize(bytes) };
  }
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(`simulate:${clientKey(request)}`, 12);
  if (!limited.ok) return NextResponse.json({ error: "Too many simulation requests." }, { status: 429, headers: rateLimitHeaders(limited) });

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 24_000) return NextResponse.json({ error: "Simulation request body is too large." }, { status: 413 });
  const body = await request.json().catch(() => null);
  const parsed = simulateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid simulation request." }, { status: 400 });
  }

  try {
    const decoded = decodeTransaction(parsed.data.serializedTransaction);
    const connection = createConnection(parsed.data.network);
    const result = await withTimeout(
      decoded.kind === "versioned"
        ? connection.simulateTransaction(decoded.transaction, { sigVerify: false, replaceRecentBlockhash: true })
        : connection.simulateTransaction(decoded.transaction, undefined, false),
      12_000,
      `${parsed.data.network} simulation`
    );
    const valueWithReplacement = result.value as typeof result.value & { replacementBlockhash?: unknown };

    return NextResponse.json({
      status: result.value.err ? "failed" : "simulation_verified",
      err: result.value.err,
      logs: result.value.logs ?? [],
      unitsConsumed: result.value.unitsConsumed,
      replacementBlockhash: valueWithReplacement.replacementBlockhash ?? null
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Simulation failed." }, { status: 400 });
  }
}
