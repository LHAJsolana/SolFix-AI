import { notFound } from "next/navigation";
import { AnalysisView } from "@/components/analysis-view";
import { Shell } from "@/components/ui";
import { getReportById } from "@/lib/database/report-store";

export const metadata = { title: "Analysis - SolFix" };

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReportById(id);
  if (!report) notFound();
  return <Shell><AnalysisView report={report} /></Shell>;
}
