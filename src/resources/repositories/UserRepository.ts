import { eq } from "drizzle-orm";

import { type User } from "../../application/entities/User.js";
import { type UserRepository } from "../../application/ports/UserRepository.js";
import { db } from "../db/client.js";
import { usersTable } from "../db/schema.js";

export class UserRepositoryDrizzle implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return existingUser;
  }
  async create(user: User): Promise<User> {
    const [existingUser] = await db.insert(usersTable).values(user).returning();
    return existingUser;
  }
}
