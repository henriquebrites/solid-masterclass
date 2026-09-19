import { beforeEach, describe, expect, it, vi } from "vitest";

import { type User } from "../../application/entities/User";
import { UserRepositoryDrizzle } from "./UserRepository";

const { selectMock, insertMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
  insertMock: vi.fn(),
}));

vi.mock("../db/client", () => ({
  db: { select: selectMock, insert: insertMock },
}));

const sampleUser: User = {
  id: "user-id",
  name: "John Doe",
  age: 20,
  phoneNumber: "+5511999999999",
  email: "john@example.com",
  password: "hashed-password",
  preferredMarketingChannel: "email",
};

beforeEach(() => {
  selectMock.mockReset();
  insertMock.mockReset();
});

describe("UserRepositoryDrizzle", () => {
  describe("findByEmail", () => {
    it("returns the user when a matching row exists", async () => {
      selectMock.mockReturnValue({
        from: () => ({
          where: () => Promise.resolve([sampleUser]),
        }),
      });
      const repository = new UserRepositoryDrizzle();

      const result = await repository.findByEmail(sampleUser.email);

      expect(result).toEqual(sampleUser);
    });

    it("returns undefined when no row matches", async () => {
      selectMock.mockReturnValue({
        from: () => ({
          where: () => Promise.resolve([]),
        }),
      });
      const repository = new UserRepositoryDrizzle();

      const result = await repository.findByEmail("missing@example.com");

      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("inserts the user and returns the persisted row", async () => {
      insertMock.mockReturnValue({
        values: () => ({
          returning: () => Promise.resolve([sampleUser]),
        }),
      });
      const repository = new UserRepositoryDrizzle();

      const result = await repository.create(sampleUser);

      expect(result).toEqual(sampleUser);
    });
  });
});
