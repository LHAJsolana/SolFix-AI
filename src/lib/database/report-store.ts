import type { Prisma } from "@prisma/client";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AnalysisReport } from "../types";
import { getPersistenceMode, PersistenceUnavailableError, validatePersistenceConfiguration } from "./persistence-mode";
import { getPrisma } from "./prisma";

type Store = {
  reports: Map<string, AnalysisReport>;
  bySlug: Map<string, AnalysisReport>;
};

const globalStore = globalThis as typeof globalThis & {
  __solfixReportStore?: Store;
  __solfixLocalWrite?: Promise<void>;
};

const store =
  globalStore.__solfixReportStore ??
  (globalStore.__solfixReportStore = {
    reports: new Map<string, AnalysisReport>(),
    bySlug: new Map<string, AnalysisReport>()
  });

let hydrated = false;
const localStoreFile = path.basename(process.env.LOCAL_REPORT_STORE_FILE || "solfix-reports.json");
const storePath = path.join(process.cwd(), ".data", localStoreFile);

function toJson(report: AnalysisReport): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(report)) as Prisma.InputJsonValue;
}

function reportColumns(report: AnalysisReport) {
  return {
    id: report.id,
    slug: report.slug,
    visibility: report.visibility,
    network: report.transaction.network,
    signature: report.transaction.signature,
    analysisVersion: report.analysisVersion,
    parserVersion: report.parserVersion,
    classifierVersion: report.classifierVersion,
    isDemo: report.isDemo,
    payload: toJson(report)
  };
}

async function hydrateLocalStore() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = await readFile(storePath, "utf8");
    const reports = JSON.parse(raw) as AnalysisReport[];
    for (const report of reports) {
      store.reports.set(report.id, report);
      store.bySlug.set(report.slug, report);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("Local report store could not be read; continuing with empty local store.");
    }
  }
}

async function flushLocalStore() {
  await mkdir(path.dirname(storePath), { recursive: true });
  const reports = [...store.reports.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const tmpPath = `${storePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmpPath, JSON.stringify(reports, null, 2), "utf8");
  await rename(tmpPath, storePath);
}

function enqueueLocalWrite() {
  const previous = globalStore.__solfixLocalWrite ?? Promise.resolve();
  const next = previous.then(flushLocalStore, flushLocalStore);
  globalStore.__solfixLocalWrite = next.catch(() => undefined);
  return next;
}

async function hydrateIfLocal() {
  if (getPersistenceMode() === "local-file") {
    await hydrateLocalStore();
  }
}

function setMemory(report: AnalysisReport) {
  store.reports.set(report.id, report);
  store.bySlug.set(report.slug, report);
}

export async function saveReport(report: AnalysisReport) {
  const mode = getPersistenceMode();
  validatePersistenceConfiguration(mode);

  if (mode === "postgres") {
    const prisma = getPrisma();
    if (!prisma) throw new PersistenceUnavailableError("PostgreSQL persistence is not configured.");
    try {
      await prisma.analysisReport.upsert({
        where: { id: report.id },
        create: reportColumns(report),
        update: reportColumns(report)
      });
      return report;
    } catch {
      throw new PersistenceUnavailableError("PostgreSQL report storage is unavailable.");
    }
  }

  await hydrateIfLocal();
  setMemory(report);
  if (mode === "local-file") await enqueueLocalWrite();
  return report;
}

export async function getReportById(id: string) {
  const mode = getPersistenceMode();
  validatePersistenceConfiguration(mode);

  if (mode === "postgres") {
    const prisma = getPrisma();
    if (!prisma) throw new PersistenceUnavailableError("PostgreSQL persistence is not configured.");
    try {
      const record = await prisma.analysisReport.findUnique({ where: { id } });
      return (record?.payload as unknown as AnalysisReport | undefined) ?? null;
    } catch {
      throw new PersistenceUnavailableError("PostgreSQL report lookup is unavailable.");
    }
  }

  await hydrateIfLocal();
  return store.reports.get(id) ?? null;
}

export async function getReportBySlug(slug: string) {
  const mode = getPersistenceMode();
  validatePersistenceConfiguration(mode);

  if (mode === "postgres") {
    const prisma = getPrisma();
    if (!prisma) throw new PersistenceUnavailableError("PostgreSQL persistence is not configured.");
    try {
      const record = await prisma.analysisReport.findUnique({ where: { slug } });
      return (record?.payload as unknown as AnalysisReport | undefined) ?? null;
    } catch {
      throw new PersistenceUnavailableError("PostgreSQL report lookup is unavailable.");
    }
  }

  await hydrateIfLocal();
  return store.bySlug.get(slug) ?? null;
}

export async function listReports() {
  const mode = getPersistenceMode();
  validatePersistenceConfiguration(mode);

  if (mode === "postgres") {
    const prisma = getPrisma();
    if (!prisma) throw new PersistenceUnavailableError("PostgreSQL persistence is not configured.");
    try {
      const records = await prisma.analysisReport.findMany({
        where: { isDemo: false },
        orderBy: { createdAt: "desc" },
        take: 50
      });
      return records.map((record) => record.payload as unknown as AnalysisReport);
    } catch {
      throw new PersistenceUnavailableError("PostgreSQL report list is unavailable.");
    }
  }

  await hydrateIfLocal();
  return [...store.reports.values()]
    .filter((report) => !report.isDemo)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveAttestation(input: {
  reportId: string;
  signature: string;
  explorerUrl: string;
}) {
  const report = await getReportById(input.reportId);
  if (!report?.attestation) return null;
  const updated: AnalysisReport = {
    ...report,
    attestation: {
      ...report.attestation,
      signature: input.signature,
      explorerUrl: input.explorerUrl
    }
  };
  const attestation = updated.attestation;
  if (!attestation) return null;
  await saveReport(updated);

  if (getPersistenceMode() === "postgres") {
    const prisma = getPrisma();
    if (!prisma) throw new PersistenceUnavailableError("PostgreSQL persistence is not configured.");
    try {
      await prisma.attestation.upsert({
        where: { id: `att_${input.reportId}` },
        create: {
          id: `att_${input.reportId}`,
          reportId: input.reportId,
          hash: attestation.reportHash,
          memo: attestation.memoPayload,
          signature: input.signature
        },
        update: {
          hash: attestation.reportHash,
          memo: attestation.memoPayload,
          signature: input.signature
        }
      });
    } catch {
      throw new PersistenceUnavailableError("PostgreSQL attestation storage is unavailable.");
    }
  }

  return updated;
}
