import { NextRequest, NextResponse } from "next/server";
import { analyzeTransaction } from "@/lib/analysis/orchestrator";
import { logEvent } from "@/lib/logging/events";
import { clientKey, rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { analyzeRequestSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const limited = rateLimit(`analyze:${clientKey(request)}`, 20);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many analysis requests. Please retry shortly." }, { status: 429, headers: rateLimitHeaders(limited) });
  }

  const body = await request.json().catch(() => null);
  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });

  try {
    logEvent("analysis_started", { demo: Boolean(parsed.data.demoScenario), network: parsed.data.network });
    const report = await analyzeTransaction(parsed.data);
    logEvent("analysis_completed", { id: report.id, category: report.diagnosis.category });
    return NextResponse.json({ id: report.id, slug: report.slug, status: "complete" });
  } catch (error) {
    logEvent("analysis_failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed." }, { status: 400 });
  }
}
