import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUserByName(name: string) {
  const [result] = await db.select().from(users).where(eq(users.name, name));
  return result;
}

export async function getUserIdByName(name: string) {
    // Assuming name is unique
    const [result] = await db.select({id: users.id}).from(users).where(eq(users.name, name));
    return result;
}


export async function getUsers() {
    const result = await db.select().from(users);
    return result;
}

export async function getUserNameById(id: string) {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
}
