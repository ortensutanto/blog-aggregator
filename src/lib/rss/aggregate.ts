import { getFeedByUrl, getNextFeedToFetch, markFeedFetched } from "../db/queries/feeds";
import { Feed } from "../db/schema";
import { fetchFeed } from "./feed";

export async function scrapeFeeds() {
    const nextFeed = await getNextFeedToFetch();
    const firstFeed: Feed = nextFeed[0] as Feed;
    await markFeedFetched(firstFeed.id);

    const feedContent = await fetchFeed(firstFeed.url);
    const items = feedContent.channel.item;
    
    for (const item of items) {
        console.log(item.title);
    }
}
