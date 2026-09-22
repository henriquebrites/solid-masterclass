import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;

describe("db client", () => {
  it("throws an explicit error naming DATABASE_URL when it is missing", async () => {
    vi.resetModules();
    vi.doMock("dotenv/config", () => ({}));
    delete process.env.DATABASE_URL;

    await expect(import("./client")).rejects.toThrow(/DATABASE_URL/);

    vi.doUnmock("dotenv/config");
  });

  it("does not throw when DATABASE_URL is set", async () => {
    vi.resetModules();
    process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;

    await expect(import("./client")).resolves.toBeDefined();
  });

  afterEach(() => {
    process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
  });
});
