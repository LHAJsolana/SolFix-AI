import { NextResponse } from "next/server";
import { safePersistenceStatus } from "@/lib/database/persistence-mode";
import { getPrisma } from "@/lib/database/prisma";
import { checkRpcHealth } from "@/lib/solana/rpc-client";

function safeError(error: unknown) {
  if (!(error instanceof Error)) return "Unknown PostgreSQL error.";
  const withCode = error as Error & { code?: string };
  const message = error.message
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted-postgres-url]")
    .replace(/:\/\/[^@\s]+@/g, "://[redacted]@");
  return withCode.code ? `${withCode.code}: ${message}` : message;
}

async function checkPostgres() {
  const persistence = safePersistenceStatus();
  if (!persistence.configured || persistence.mode !== "postgres") {
    return { ok: false, mode: persistence.mode, error: persistence.error ?? "PostgreSQL persistence is required." };
  }
  try {
    const prisma = getPrisma();
    if (!prisma) return { ok: false, mode: "postgres", error: "PostgreSQL is not configured." };
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, mode: "postgres" };
  } catch (error) {
    return { ok: false, mode: "postgres", error: safeError(error) };
  }
}

export async function GET() {
  const [postgres, mainnet, devnet] = await Promise.all([
    checkPostgres(),
    checkRpcHealth("mainnet-beta"),
    checkRpcHealth("devnet")
  ]);
  const ready = postgres.ok && mainnet.ok && devnet.ok;

  return NextResponse.json(
    {
      ready,
      persistence: postgres,
      rpc: {
        mainnet: { ok: mainnet.ok, blockHeight: mainnet.ok ? mainnet.blockHeight : undefined, error: mainnet.ok ? undefined : mainnet.error },
        devnet: { ok: devnet.ok, blockHeight: devnet.ok ? devnet.blockHeight : undefined, error: devnet.ok ? undefined : devnet.error }
      },
      deterministicAnalysis: { ok: true },
      optionalAi: { required: false, provider: process.env.AI_PROVIDER || "deterministic" }
    },
    { status: ready ? 200 : 503 }
  );
}
