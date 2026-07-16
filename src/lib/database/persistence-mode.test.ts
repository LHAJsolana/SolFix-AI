import { afterEach, describe, expect, it, vi } from "vitest";
import { getPersistenceMode, validatePersistenceConfiguration } from "./persistence-mode";

const originalEnv = { ...process.env };

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...originalEnv };
});

describe("persistence mode", () => {
  it("defaults tests to memory", () => {
    delete process.env.PERSISTENCE_MODE;
    vi.stubEnv("NODE_ENV", "test");
    expect(getPersistenceMode()).toBe("memory");
  });

  it("refuses local-file persistence in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PERSISTENCE_MODE", "local-file");
    expect(() => validatePersistenceConfiguration()).toThrow(/Production deployments must use/);
  });

  it("requires DATABASE_URL for postgres mode", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PERSISTENCE_MODE", "postgres");
    delete process.env.DATABASE_URL;
    expect(() => validatePersistenceConfiguration()).toThrow(/DATABASE_URL/);
  });
});
