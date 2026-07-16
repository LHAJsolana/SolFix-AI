import { PrismaClient } from "@prisma/client";
import { getPersistenceMode, validatePersistenceConfiguration } from "./persistence-mode";

const globalForPrisma = globalThis as typeof globalThis & { __solfixPrisma?: PrismaClient };

export function getPrisma() {
  if (getPersistenceMode() !== "postgres") return null;
  validatePersistenceConfiguration("postgres");
  globalForPrisma.__solfixPrisma ??= new PrismaClient();
  return globalForPrisma.__solfixPrisma;
}
