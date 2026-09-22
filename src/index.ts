import { buildApp } from "./drivers/app.js";
import { registerProcessLifecycle } from "./drivers/processLifecycle.js";
import { db } from "./resources/db/client.js";

const app = buildApp();

await app.ready();

registerProcessLifecycle(app, db);

await app.listen({
  port: 4949,
});

console.log(`Documentation running at http://localhost:4949/docs`);
