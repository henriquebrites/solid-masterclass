import { describe, expect, it } from "vitest";

import {
  EmailAlreadyExistsError,
  InvalidMarketingPreferredChannelError,
  PasswordDoNotMatchError,
  UserCreationError,
} from "./index";

describe("errors", () => {
  it.each([
    [PasswordDoNotMatchError, "PasswordDoNotMatchError", "Passwords do not match"],
    [EmailAlreadyExistsError, "EmailAlreadyExistsError", "Email already exists"],
    [
      InvalidMarketingPreferredChannelError,
      "InvalidMarketingPreferredChannelError",
      "Invalid marketing preferred channel",
    ],
    [UserCreationError, "UserCreationError", "Error creating user"],
  ])("%s has message %j", (ErrorClass, name, message) => {
    const error = new ErrorClass();

    expect(error).toBeInstanceOf(Error);
    expect(error.constructor.name).toBe(name);
    expect(error.name).toBe("Error");
    expect(error.message).toBe(message);
  });
});
