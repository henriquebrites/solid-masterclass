import { beforeEach, describe, expect, it, vi } from "vitest";

import { type CreateUserInput, UserDAODrizzle } from "./UserDAO";

const { selectMock, insertMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
  insertMock: vi.fn(),
}));

vi.mock("../db/client", () => ({
  db: { select: selectMock, insert: insertMock },
}));

const dbRecord = {
  id: "user-id",
  name: "John Doe",
  age: 20,
  phoneNumber: "+5511999999999",
  email: "john@example.com",
  password: "hashed-password",
  preferredMarketingChannel: "email",
};

const newUser: CreateUserInput = {
  name: dbRecord.name,
  age: dbRecord.age,
  phoneNumber: dbRecord.phoneNumber,
  email: dbRecord.email,
  password: dbRecord.password,
  preferredMarketingChannel: dbRecord.preferredMarketingChannel,
};

beforeEach(() => {
  selectMock.mockReset();
  insertMock.mockReset();
});

describe("UserDAODrizzle", () => {
  describe("findByEmail", () => {
    it("maps the record to the domain User when found", async () => {
      selectMock.mockReturnValue({
        from: () => ({
          where: () => Promise.resolve([dbRecord]),
        }),
      });
      const dao = new UserDAODrizzle();

      const result = await dao.findByEmail(dbRecord.email);

      expect(result).toEqual(dbRecord);
    });

    it("returns undefined when no record matches", async () => {
      selectMock.mockReturnValue({
        from: () => ({
          where: () => Promise.resolve([]),
        }),
      });
      const dao = new UserDAODrizzle();

      const result = await dao.findByEmail("missing@example.com");

      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("inserts the user and maps the persisted record to the domain User", async () => {
      insertMock.mockReturnValue({
        values: () => ({
          returning: () => Promise.resolve([dbRecord]),
        }),
      });
      const dao = new UserDAODrizzle();

      const result = await dao.create(newUser);

      expect(result).toEqual(dbRecord);
    });
  });
});
