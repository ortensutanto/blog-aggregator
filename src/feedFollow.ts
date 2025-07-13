import { readConfig } from "./config";
import { createFeedFollows, deleteFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feedfollows";
import { getFeedByUrl } from "./lib/db/queries/feeds";
import { getUserIdByName } from "./lib/db/queries/users";

export async function handlerFollow(cmdName: string, ...cmdArgs: string[]) {
    const currUser = readConfig();
    const currUserId = await getUserIdByName(currUser.currentUserName);
    const url = cmdArgs[0];
    const feed = await getFeedByUrl(url);
    if (!feed) {
        throw new Error(`Feed with url: ${url} does not exist`);
    }
    const result = await createFeedFollows(currUserId.id, feed.id);
    console.log(`Feed Name: ${result.feeds.name}`);
    console.log(`User Name: ${result.users.name}`);
}

export async function handlerFollowing() {
    const currUser = readConfig();
    const currUserId = await getUserIdByName(currUser.currentUserName);
    const feedFollows = await getFeedFollowsForUser(currUserId.id);
    for (const feedFollow of feedFollows) {
        console.log(feedFollow.feedName);
    }
}

export async function handlerUnfollow(cmdName: string, ...cmdArgs: string[]) {
    const currUser = readConfig();
    const currUserId = await getUserIdByName(currUser.currentUserName);
    if (!currUserId) {
        throw new Error("User does not exist");
    }
    const url = cmdArgs[0];
    const feedId = await getFeedByUrl(url);
    if (!feedId) {
        throw new Error("Feed does not exist");
    }

    const result = await deleteFeedFollow(currUserId.id, feedId.id);
    console.log(`Feed ${feedId.name} has been unfollowed`);
}
