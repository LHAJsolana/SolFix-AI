ALTER TABLE "AnalysisReport" ADD COLUMN "network" TEXT;
ALTER TABLE "AnalysisReport" ADD COLUMN "signature" TEXT;
ALTER TABLE "AnalysisReport" ADD COLUMN "analysisVersion" TEXT;
ALTER TABLE "AnalysisReport" ADD COLUMN "parserVersion" TEXT;
ALTER TABLE "AnalysisReport" ADD COLUMN "classifierVersion" TEXT;
ALTER TABLE "AnalysisReport" ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "AnalysisReport_network_signature_idx" ON "AnalysisReport"("network", "signature");
CREATE INDEX "AnalysisReport_isDemo_idx" ON "AnalysisReport"("isDemo");
CREATE INDEX "AnalysisReport_analysisVersion_idx" ON "AnalysisReport"("analysisVersion");
CREATE INDEX "AnalysisReport_createdAt_idx" ON "AnalysisReport"("createdAt");
