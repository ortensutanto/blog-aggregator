import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { Feed, feeds } from "../schema";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db.insert(feeds).values({name: name, url: url, userId: userId}).returning();
  return result;
}

export async function getFeeds(): Promise<Feed[]> {
    const result = await db.select().from(feeds);
    return result;
}

export async function getFeedByUrl(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

export async function markFeedFetched(feedId: string) {
    const [result] = await db.update(feeds).set({ updatedAt: new Date(), lastFetchedAt: new Date()})  
    .where(eq(feeds.id, feedId));
    return result;
}

export async function getNextFeedToFetch() {
    const result = await db.execute(sql`SELECT * FROM feeds ORDER BY "last_fetched_at" ASC NULLS FIRST LIMIT 1`);
    return result;
} 
