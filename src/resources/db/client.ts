import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z
    .string({ message: "A variável de ambiente DATABASE_URL é obrigatória" })
    .min(1, { message: "A variável de ambiente DATABASE_URL é obrigatória" }),
});

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  throw new Error(parsedEnv.error.issues[0]?.message ?? "A variável de ambiente DATABASE_URL é obrigatória");
}

export const db = drizzle(parsedEnv.data.DATABASE_URL);
