export type PersistenceMode = "postgres" | "local-file" | "memory";

export class PersistenceConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PersistenceConfigurationError";
  }
}

export class PersistenceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PersistenceUnavailableError";
  }
}

const modes = new Set<PersistenceMode>(["postgres", "local-file", "memory"]);

export function getPersistenceMode(): PersistenceMode {
  const configured = process.env.PERSISTENCE_MODE;
  if (configured) {
    if (!modes.has(configured as PersistenceMode)) {
      throw new PersistenceConfigurationError(`Unsupported PERSISTENCE_MODE "${configured}".`);
    }
    return configured as PersistenceMode;
  }

  if (process.env.NODE_ENV === "test") return "memory";
  if (process.env.NODE_ENV === "production") return "postgres";
  return "local-file";
}

export function validatePersistenceConfiguration(mode = getPersistenceMode()) {
  if (process.env.NODE_ENV === "production" && mode !== "postgres") {
    throw new PersistenceConfigurationError("Production deployments must use PERSISTENCE_MODE=postgres.");
  }
  if (mode === "postgres" && !process.env.DATABASE_URL) {
    throw new PersistenceConfigurationError("PERSISTENCE_MODE=postgres requires DATABASE_URL.");
  }
  if (mode === "local-file" && process.env.NODE_ENV === "production") {
    throw new PersistenceConfigurationError("local-file persistence is not allowed in production.");
  }
  if (mode === "memory" && process.env.NODE_ENV === "production") {
    throw new PersistenceConfigurationError("memory persistence is not allowed in production.");
  }
}

export function safePersistenceStatus() {
  try {
    const mode = getPersistenceMode();
    validatePersistenceConfiguration(mode);
    return { mode, configured: true, error: null };
  } catch (error) {
    return {
      mode: process.env.PERSISTENCE_MODE || (process.env.NODE_ENV === "production" ? "postgres" : "local-file"),
      configured: false,
      error: error instanceof Error ? error.message : "Persistence configuration is invalid."
    };
  }
}
