export class PasswordDoNotMatchError extends Error {
  constructor() {
    super("Passwords do not match");
  }
}

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super("Email already exists");
  }
}

export class InvalidMarketingPreferredChannelError extends Error {
  constructor() {
    super("Invalid marketing preferred channel");
  }
}

export class UserCreationError extends Error {
  constructor() {
    super("Error creating user");
  }
}
