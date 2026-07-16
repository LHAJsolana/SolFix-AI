import { NextResponse } from "next/server";
import { getReportById } from "@/lib/database/report-store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const report = await getReportById(id);
    if (!report) return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Report storage is unavailable." }, { status: 503 });
  }
}
