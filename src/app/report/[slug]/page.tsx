import { notFound } from "next/navigation";
import { AnalysisView } from "@/components/analysis-view";
import { Shell } from "@/components/ui";
import { getReportBySlug } from "@/lib/database/report-store";

export const metadata = { title: "Report - SolFix" };

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getReportBySlug(slug);
  if (!report) notFound();
  return <Shell><AnalysisView report={report} /></Shell>;
}
