import { eq } from "drizzle-orm";
import { db } from "..";
import { Posts, posts } from "../schema";

export async function createPost(post: PostInsert) {
    const [result] = await db.insert(posts)
    .values({title: post.title, url: post.url, description: post.description, publishedAt: post.publishedAt,
            feedId: post.feedId
    }).returning();
    return result;
}

export async function getPostByUrl(url: string) {
    const [result] = await db.select().from(posts).where(eq(posts.url, url));
    return result;
}

export async function updatePost(post: PostInsert) {
    const [result] = await db.update(posts)
    .set({title: post.title, description: post.description, publishedAt: post.publishedAt})
    .where(eq(posts.url, post.url)).returning();

    return result;
}

export async function getPostsForUser(postCount: number = 2) {
    const result = await db.select().from(posts).limit(postCount);
    return result;
}

export type PostInsert = {
    title: string;
    url: string;
    description: string | null; 
    publishedAt: Date;
    feedId: string;
}
