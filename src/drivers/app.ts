import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastify from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { z } from "zod/v4";

import {
  EmailAlreadyExistsError,
  InvalidMarketingPreferredChannelError,
  PasswordDoNotMatchError,
} from "../application/errors/index.js";
import { CreateUser } from "../application/usecases/CreateUser.js";
import { SendNotificationFactory } from "../resources/notifications/SendNotificationFactory.js";
import { UserRepositoryDrizzle } from "../resources/repositories/UserRepository.js";

export const buildApp = () => {
  const app = fastify();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "SampleApi",
        description: "Sample backend service",
        version: "1.0.0",
      },
      servers: [],
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUI, {
    routePrefix: "/docs",
  });

  app.after(() => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "POST",
      url: "/users",
      schema: {
        body: z.object({
          name: z.string().trim().min(1),
          age: z.number().int().min(18).max(100),
          phoneNumber: z
            .string()
            .trim()
            .startsWith("+55", { message: "O número deve começar com +55" })
            .regex(/^\+55\d{2}9?\d{8}$/, "Número de telefone inválido. Use o formato +55DD9XXXXXXXX"),
          email: z.email(),
          password: z.string().min(8),
          passwordConfirmation: z.string().min(8),
          preferredMarketingChannel: z.enum(["email", "sms", "push", "whatsapp"]),
        }),
        response: {
          201: z.object({
            id: z.uuid(),
            name: z.string(),
            age: z.number(),
            phoneNumber: z.string(),
            email: z.string(),
            preferredMarketingChannel: z.string(),
          }),
          400: z.object({
            error: z.string(),
          }),
          409: z.object({
            error: z.string(),
          }),
          500: z.object({
            error: z.string(),
          }),
        },
      },
      handler: async (req, res) => {
        try {
          const createUser = new CreateUser(new UserRepositoryDrizzle(), new SendNotificationFactory());
          const output = await createUser.execute(req.body);
          return res.status(201).send(output);
        } catch (error) {
          if (error instanceof PasswordDoNotMatchError) {
            return res.status(400).send({ error: "Passwords do not match" });
          }
          if (error instanceof EmailAlreadyExistsError) {
            return res.status(409).send({ error: "E-mail já cadastrado" });
          }
          if (error instanceof InvalidMarketingPreferredChannelError) {
            return res.status(400).send({ error: "Invalid marketing preferred channel" });
          }
          return res.status(500).send({ error: "Erro ao criar usuário" });
        }
      },
    });
  });
  return app;
};
