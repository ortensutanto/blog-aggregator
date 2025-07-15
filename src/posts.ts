import { getPostsForUser } from "./lib/db/queries/posts";

export async function handlerBrowse(cmdName: string, ...args: string[]) {
    let limitCount = 2;
    if (args[0]) {
        limitCount = Number(args[0]);
    }
    const posts = await getPostsForUser(limitCount);
    for (const post of posts) {
        console.log(post);
    }
}
