import { NextResponse } from "next/server";
import { getReportBySlug } from "@/lib/database/report-store";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getReportBySlug(slug).catch(() => null);
  if (!report || report.visibility === "private") return NextResponse.json({ error: "Report not found." }, { status: 404 });

  return new NextResponse(JSON.stringify(report, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="solfix-${report.slug}.json"`
    }
  });
}
