import { NextResponse } from "next/server";
import { safePersistenceStatus } from "@/lib/database/persistence-mode";
import { getPrisma } from "@/lib/database/prisma";
import { checkRpcHealth } from "@/lib/solana/rpc-client";

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
  } catch {
    return { ok: false, mode: "postgres", error: "PostgreSQL is unreachable." };
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
