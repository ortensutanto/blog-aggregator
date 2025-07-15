import { getPostsForUser } from "./lib/db/queries/posts";
import { Posts } from "./lib/db/schema";

function logPost(post: Posts) {
    console.log("==============");
    console.log(`Title: ${post.title}`);
    console.log(`URL: ${post.url}`);
    console.log(`Published At: ${post.publishedAt}`);
    console.log(`Description: ${post.description}`);
    console.log("==============");
}

export async function handlerBrowse(cmdName: string, ...args: string[]) {
    let limitCount = 2;
    if (args[0]) {
        limitCount = Number(args[0]);
    }
    const posts = await getPostsForUser(limitCount);
    for (const post of posts) {
        logPost(post);
    }
}
