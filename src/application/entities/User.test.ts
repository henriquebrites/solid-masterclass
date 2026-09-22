import { describe, expectTypeOf, it } from "vitest";

import { type User } from "./User";

describe("User", () => {
  it("requires the fields the interface already defines, with no invented validation", () => {
    expectTypeOf<User>().toEqualTypeOf<{
      id: string;
      name: string;
      age: number;
      phoneNumber: string;
      email: string;
      password: string;
      preferredMarketingChannel: string;
    }>();
  });
});
