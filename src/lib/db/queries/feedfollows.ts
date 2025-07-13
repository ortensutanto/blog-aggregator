import { and, eq } from "drizzle-orm";
import { db } from "..";
import { feed_follows, feeds, users } from "../schema";

export async function createFeedFollows(userId: string, feedId: string) {
  const [newFeedFollow] = await db.insert(feed_follows).values({userId: userId, feedId: feedId}).returning();

  const [result] = await db.select().from(feed_follows)
  .where(eq(feed_follows.id, newFeedFollow.id))
  .innerJoin(users, eq(users.id, feed_follows.userId))
  .innerJoin(feeds, eq(feeds.id, feed_follows.feedId));

  return result;
}

export async function getFeedFollowsForUser(userId: string) {
    const result = await db.select({ feedName: feeds.name }).from(feed_follows)
    .where(eq(feed_follows.userId, userId))
    .innerJoin(users, eq(users.id, feed_follows.userId))
    .innerJoin(feeds, eq(feeds.id, feed_follows.feedId));
    
    // const result = await db.select({feed_follows}).from(feed_follows).where(eq(feed_follows.userId, userId));

    return result;
}

export async function getFeedFollowExists(userId: string, feedId: string) {
    const [result] = await db.select().from(feed_follows)
    .where(and(eq(feed_follows.userId, userId), eq(feed_follows.feedId, feedId)));
    return result;
}
