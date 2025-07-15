import { getFeedByUrl, getNextFeedToFetch, markFeedFetched } from "../db/queries/feeds";
import { createPost, getPostByUrl, PostInsert, updatePost } from "../db/queries/posts";
import { Feed, Posts } from "../db/schema";
import { fetchFeed } from "./feed";

function toDate(dateString: string): Date {
    const dateStringPattern = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/;

    const [match, ...parts] = dateString.match(dateStringPattern) ?? [];
    if (!match) {
        // Handle this error somehow
        throw new Error(`Incorrectly formatted string: '${dateString}'`)
    }

    const [year, month, day, hour, minute] = parts.map((part) => parseInt(part, 10));
    const formattedDate: Date = new Date(year, month - 1, day, hour, minute); 
    return formattedDate;
}

export async function scrapeFeeds() {
    const nextFeed = await getNextFeedToFetch();
    const firstFeed: Feed = nextFeed[0] as Feed;
    await markFeedFetched(firstFeed.id);

    const feedContent = await fetchFeed(firstFeed.url);
    const items = feedContent.channel.item;

    
    for (const item of items) {
        let newDate;
        try {
            newDate = toDate(item.pubDate);
        } catch (err) {
            newDate = new Date();
        } // if date doesn't work for some reason, set it to now.
        const newPost: PostInsert = {
            title: item.title,
            url: item.link,
            description: item.description,
            publishedAt: newDate,
            feedId: firstFeed.id
        };
        // Check if posts exists update it instead, since url has to be unique
        const postExists = await getPostByUrl(newPost.url);
        if (postExists) {
            await updatePost(newPost);
        } else {
            await createPost(newPost)
        }
    }
}
