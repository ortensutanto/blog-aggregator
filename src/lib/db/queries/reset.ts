import { db } from "..";
import { feeds, users } from "../schema";

export async function resetTables() {
    await db.delete(users);
    await db.delete(feeds);
}
