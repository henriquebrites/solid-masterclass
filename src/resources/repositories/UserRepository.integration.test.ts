import { beforeEach, describe, expect, it } from "vitest";

import { type User } from "../../application/entities/User";
import { db } from "../db/client";
import { usersTable } from "../db/schema";
import { UserRepositoryDrizzle } from "./UserRepository";

const sampleUser: User = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "John Doe",
  age: 20,
  phoneNumber: "+5511999999999",
  email: "john@example.com",
  password: "hashed-password",
  preferredMarketingChannel: "email",
};

beforeEach(async () => {
  await db.delete(usersTable);
});

describe("UserRepositoryDrizzle (real database)", () => {
  it("persists the user and returns the saved record", async () => {
    const repository = new UserRepositoryDrizzle();

    const result = await repository.create(sampleUser);

    expect(result).toMatchObject(sampleUser);

    const rows = await db.select().from(usersTable);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject(sampleUser);
  });

  it("returns the matching record for an existing email", async () => {
    const repository = new UserRepositoryDrizzle();
    await repository.create(sampleUser);

    const result = await repository.findByEmail(sampleUser.email);

    expect(result).toMatchObject(sampleUser);
  });

  it("returns undefined for a non-existent email", async () => {
    const repository = new UserRepositoryDrizzle();

    const result = await repository.findByEmail("missing@example.com");

    expect(result).toBeUndefined();
  });
});
