import { NextResponse } from "next/server";
import { getReportBySlug } from "@/lib/database/report-store";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const report = await getReportBySlug(slug);
    if (!report || report.visibility === "private") return NextResponse.json({ error: "Report not found." }, { status: 404 });
    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Report storage is unavailable." }, { status: 503 });
  }
}
