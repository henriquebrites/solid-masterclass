import bcrypt from "bcrypt";

import { type UserRepository } from "../../resources/repositories/UserRepository.js";
import {
  EmailAlreadyExistsError,
  InvalidMarketingPreferredChannelError,
  PasswordDoNotMatchError,
  UserCreationError,
} from "../errors/index.js";
import { SendNotificationFactory } from "../factories/index.js";

interface InputDTO {
  name: string;
  age: number;
  phoneNumber: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  preferredMarketingChannel: string;
}

interface OutputDTO {
  id: string;
  name: string;
  age: number;
  phoneNumber: string;
  email: string;
  preferredMarketingChannel: string;
}

export class CreateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    if (input.password !== input.passwordConfirmation) {
      throw new PasswordDoNotMatchError();
    }
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new EmailAlreadyExistsError();
    }
    if (!["email", "sms", "push", "whatsapp"].includes(input.preferredMarketingChannel)) {
      throw new InvalidMarketingPreferredChannelError();
    }
    const user = await this.userRepository.create({
      id: crypto.randomUUID(),
      name: input.name,
      age: input.age,
      phoneNumber: input.phoneNumber,
      email: input.email,
      password: await bcrypt.hash(input.password, 10),
      preferredMarketingChannel: input.preferredMarketingChannel,
    });
    if (!user) {
      throw new UserCreationError();
    }
    await SendNotificationFactory.create(input.preferredMarketingChannel).send();
    return {
      id: user.id,
      name: user.name,
      age: user.age,
      phoneNumber: user.phoneNumber,
      email: user.email,
      preferredMarketingChannel: user.preferredMarketingChannel,
    };
  }
}
