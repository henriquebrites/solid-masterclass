import { beforeEach, describe, expect, it, vi } from "vitest";

import { type UserRepository } from "../../resources/repositories/UserRepository";
import { type User } from "../entities/User";
import {
  EmailAlreadyExistsError,
  InvalidMarketingPreferredChannelError,
  PasswordDoNotMatchError,
  UserCreationError,
} from "../errors";
import { CreateUser } from "./CreateUser";

const { sendMock, createMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
  createMock: vi.fn(),
}));

vi.mock("../factories", () => ({
  SendNotificationFactory: { create: createMock },
}));

const validInput = {
  name: "John Doe",
  age: 20,
  phoneNumber: "+5511999999999",
  email: "john@example.com",
  password: "password123",
  passwordConfirmation: "password123",
  preferredMarketingChannel: "email",
};

type MockedUserRepository = {
  findByEmail: ReturnType<typeof vi.fn<UserRepository["findByEmail"]>>;
  create: ReturnType<typeof vi.fn<UserRepository["create"]>>;
};

const buildRepository = (overrides: Partial<MockedUserRepository> = {}): MockedUserRepository => ({
  findByEmail: vi.fn<UserRepository["findByEmail"]>().mockResolvedValue(null),
  create: vi.fn<UserRepository["create"]>().mockImplementation((user: User) => Promise.resolve(user)),
  ...overrides,
});

beforeEach(() => {
  sendMock.mockReset().mockResolvedValue(undefined);
  createMock.mockReset().mockReturnValue({ send: sendMock });
});

describe("CreateUser", () => {
  it("throws PasswordDoNotMatchError and never touches the repository when passwords differ", async () => {
    const repository = buildRepository();
    const useCase = new CreateUser(repository);

    await expect(useCase.execute({ ...validInput, passwordConfirmation: "different123" })).rejects.toThrow(
      PasswordDoNotMatchError,
    );

    expect(repository.findByEmail).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("throws EmailAlreadyExistsError when the e-mail is already registered", async () => {
    const repository = buildRepository({
      findByEmail: vi.fn().mockResolvedValue({
        id: "existing-id",
        name: "Existing User",
        age: 30,
        phoneNumber: "+5511888888888",
        email: validInput.email,
        password: "hashed",
        preferredMarketingChannel: "email",
      }),
    });
    const useCase = new CreateUser(repository);

    await expect(useCase.execute(validInput)).rejects.toThrow(EmailAlreadyExistsError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("throws InvalidMarketingPreferredChannelError for an unsupported channel", async () => {
    const repository = buildRepository();
    const useCase = new CreateUser(repository);

    await expect(
      useCase.execute({
        ...validInput,
        preferredMarketingChannel: "carrier-pigeon",
      }),
    ).rejects.toThrow(InvalidMarketingPreferredChannelError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("throws UserCreationError when the repository fails to return the created user", async () => {
    const repository = buildRepository({
      create: vi.fn().mockResolvedValue(undefined),
    });
    const useCase = new CreateUser(repository);

    await expect(useCase.execute(validInput)).rejects.toThrow(UserCreationError);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("creates the user with a hashed password and returns the public fields", async () => {
    const repository = buildRepository();
    const useCase = new CreateUser(repository);

    const output = await useCase.execute(validInput);

    expect(repository.create).toHaveBeenCalledTimes(1);
    const createdUser = repository.create.mock.calls[0][0] as User;
    expect(createdUser.password).not.toBe(validInput.password);
    expect(createdUser.id).toEqual(expect.any(String));

    expect(output).toEqual({
      id: createdUser.id,
      name: validInput.name,
      age: validInput.age,
      phoneNumber: validInput.phoneNumber,
      email: validInput.email,
      preferredMarketingChannel: validInput.preferredMarketingChannel,
    });
    expect(output).not.toHaveProperty("password");
  });

  it("sends a notification through the channel chosen by the user", async () => {
    const repository = buildRepository();
    const useCase = new CreateUser(repository);

    await useCase.execute({ ...validInput, preferredMarketingChannel: "sms" });

    expect(createMock).toHaveBeenCalledWith("sms");
    expect(sendMock).toHaveBeenCalledTimes(1);
  });
});
