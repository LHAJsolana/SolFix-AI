CREATE TABLE "AnalysisReport" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Attestation" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attestation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnalysisReport_slug_key" ON "AnalysisReport"("slug");
CREATE INDEX "AnalysisReport_visibility_idx" ON "AnalysisReport"("visibility");
CREATE UNIQUE INDEX "Attestation_reportId_key" ON "Attestation"("reportId");
CREATE INDEX "Attestation_hash_idx" ON "Attestation"("hash");

ALTER TABLE "Attestation" ADD CONSTRAINT "Attestation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "AnalysisReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
