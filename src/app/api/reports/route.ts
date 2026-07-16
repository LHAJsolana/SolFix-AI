import { NextRequest, NextResponse } from "next/server";
import { getReportById, listReports, saveReport } from "@/lib/database/report-store";

export async function GET() {
  return NextResponse.json({ reports: await listReports() });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const id = typeof body?.analysisId === "string" ? body.analysisId : "";
  const visibility = body?.visibility === "private" || body?.visibility === "unlisted" ? body.visibility : "public";
  const report = await getReportById(id);
  if (!report) return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  const updated = await saveReport({ ...report, visibility });
  return NextResponse.json({ slug: updated.slug, visibility: updated.visibility });
}
