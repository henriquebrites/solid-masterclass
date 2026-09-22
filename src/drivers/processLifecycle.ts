import type { FastifyInstance } from "fastify";

interface ClosableDb {
  $client: { end: () => Promise<void> };
}

export const registerProcessLifecycle = (app: FastifyInstance, db: ClosableDb) => {
  const shutdown = async () => {
    try {
      await db.$client.end();
    } catch (error) {
      app.log.error(error);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => void shutdown());
  process.on("SIGINT", () => void shutdown());

  process.on("unhandledRejection", (reason) => {
    app.log.error(reason);
    process.exit(1);
  });

  process.on("uncaughtException", (error) => {
    app.log.error(error);
    process.exit(1);
  });
};
