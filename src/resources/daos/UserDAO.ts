// DAO - Data Access Object
import { eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { usersTable } from "../db/schema.js";

// Tipos agnósticos de ORM (contrato da interface)
export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  phoneNumber: string;
  password: string;
  preferredMarketingChannel: string;
}

export type CreateUserInput = Omit<User, "id">;

// Tipos específicos do Drizzle (implementação)
type UserRecord = typeof usersTable.$inferSelect;

// Abstração
export interface UserDAO {
  findByEmail(email: string): Promise<User | undefined>;
  create(user: CreateUserInput): Promise<User>;
}

// Implementação
export class UserDAODrizzle implements UserDAO {
  async findByEmail(email: string): Promise<User | undefined> {
    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return existingUser ? this.mapToDomain(existingUser) : undefined;
  }

  async create(user: CreateUserInput): Promise<User> {
    const [createdUser] = await db.insert(usersTable).values(user).returning();
    return this.mapToDomain(createdUser);
  }

  private mapToDomain(record: UserRecord): User {
    return {
      id: record.id,
      email: record.email,
      name: record.name,
      age: record.age,
      phoneNumber: record.phoneNumber,
      password: record.password,
      preferredMarketingChannel: record.preferredMarketingChannel,
    };
  }
}
