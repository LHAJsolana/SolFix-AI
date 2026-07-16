import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveAttestation } from "@/lib/database/report-store";
import { clientKey, rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { explorerTxUrl } from "@/lib/solana/explorer";

const submitSchema = z.object({
  reportId: z.string().min(1),
  signature: z.string().min(64).max(120)
});

export async function POST(request: NextRequest) {
  const limited = rateLimit(`attest-submit:${clientKey(request)}`, 10);
  if (!limited.ok) return NextResponse.json({ error: "Too many attestation submissions." }, { status: 429, headers: rateLimitHeaders(limited) });
  const body = await request.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid attestation submission." }, { status: 400 });

  const updated = await saveAttestation({
    reportId: parsed.data.reportId,
    signature: parsed.data.signature,
    explorerUrl: explorerTxUrl(parsed.data.signature, "devnet")
  });
  if (!updated) return NextResponse.json({ error: "Report not found." }, { status: 404 });
  return NextResponse.json({ attestation: updated.attestation });
}
