import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("dotenv/config", () => ({}));

const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
});

describe("db client", () => {
  it("throws an explicit error naming DATABASE_URL when it is missing", async () => {
    delete process.env.DATABASE_URL;

    await expect(import("./client")).rejects.toThrow(/DATABASE_URL/);
  });

  it("does not throw when DATABASE_URL is set", async () => {
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/solid_masterclass";

    await expect(import("./client")).resolves.toBeDefined();
  });
});
