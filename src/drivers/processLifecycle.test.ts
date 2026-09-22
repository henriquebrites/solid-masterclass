import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";

import { registerProcessLifecycle } from "./processLifecycle";

const buildFakeApp = () =>
  ({
    log: { error: vi.fn() },
  }) as unknown as FastifyInstance;

const removeAllTestListeners = () => {
  process.removeAllListeners("SIGTERM");
  process.removeAllListeners("SIGINT");
  process.removeAllListeners("unhandledRejection");
  process.removeAllListeners("uncaughtException");
};

afterEach(() => {
  removeAllTestListeners();
  vi.restoreAllMocks();
});

describe("registerProcessLifecycle", () => {
  it("logs and exits on unhandledRejection", () => {
    const app = buildFakeApp();
    const db = { $client: { end: vi.fn().mockResolvedValue(undefined) } };
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    registerProcessLifecycle(app, db);
    const reason = new Error("boom");
    process.emit("unhandledRejection", reason, Promise.resolve());

    expect(app.log.error).toHaveBeenCalledWith(reason);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("logs and exits on uncaughtException", () => {
    const app = buildFakeApp();
    const db = { $client: { end: vi.fn().mockResolvedValue(undefined) } };
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    registerProcessLifecycle(app, db);
    const error = new Error("fatal");
    process.emit("uncaughtException", error);

    expect(app.log.error).toHaveBeenCalledWith(error);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("closes the database connection on SIGTERM", async () => {
    const app = buildFakeApp();
    const end = vi.fn().mockResolvedValue(undefined);
    const db = { $client: { end } };
    vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    registerProcessLifecycle(app, db);
    process.emit("SIGTERM");
    await new Promise((resolve) => setImmediate(resolve));

    expect(end).toHaveBeenCalled();
  });

  it("closes the database connection on SIGINT", async () => {
    const app = buildFakeApp();
    const end = vi.fn().mockResolvedValue(undefined);
    const db = { $client: { end } };
    vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    registerProcessLifecycle(app, db);
    process.emit("SIGINT");
    await new Promise((resolve) => setImmediate(resolve));

    expect(end).toHaveBeenCalled();
  });

  it("logs and still exits when closing the connection fails", async () => {
    const app = buildFakeApp();
    const closeError = new Error("connection already closed");
    const db = { $client: { end: vi.fn().mockRejectedValue(closeError) } };
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    registerProcessLifecycle(app, db);
    process.emit("SIGTERM");
    await new Promise((resolve) => setImmediate(resolve));
    await new Promise((resolve) => setImmediate(resolve));

    expect(app.log.error).toHaveBeenCalledWith(closeError);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});
