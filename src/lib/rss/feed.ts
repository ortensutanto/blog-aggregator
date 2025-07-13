import { XMLParser } from "fast-xml-parser";
import { createFeed, getFeedByUrl, updateFeedFetch } from "../db/queries/feeds";
import { Feed, User, users } from "../db/schema";
import { createFeedFollows, getFeedFollowExists } from "../db/queries/feedfollows";

export type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

export type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

function validateRssItem(item: any): item is RSSItem  {
    if (!("title" in item)) {
        return false;
    }
    if (!("link" in item)) {
        return false;
    }
    if (!("description" in item)) {
        return false;
    }
    if (!("pubDate" in item)) {
        return false;
    }
    return true;
}

export async function fetchFeed(feedUrl: string) {
    const response = await fetch(feedUrl, {
        headers: {
            "User-Agent": "gator"
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }

    const responseString = await response.text();
    const parser = new XMLParser();

    const parsedResponse = parser.parse(responseString);

    if (!("channel" in parsedResponse.rss)) {
        throw new Error("RSS Feed has no channel field");
    }
    const channel = parsedResponse.rss.channel;

    if (!("title" in channel) || !("link" in channel) 
        || !("description" in channel)) {
            throw new Error("RSS Channel missing properties (title, link, or description)");
    }
    
    const title = channel.title;
    const link = channel.link;
    const description = channel.description;

    const items: RSSItem[] = Array.isArray(channel.item) ?
        channel.item.filter(validateRssItem) :
        [];

    return {
        channel: {
            title: title,
            link: link,
            description: description,
            item: items,
        },
    };
}

export async function addFeed(feedName: string, feedUrl: string, userId: string) {
    try {
        const feedCheck = await getFeedByUrl(feedUrl);
        let feedResult;
        if (!feedCheck) {
            feedResult = await createFeed(feedName, feedUrl, userId);
        } else {
            feedResult = feedCheck;
        }
        const checkFeedFollowsExist = await getFeedFollowExists(userId, feedResult.id);
        if (checkFeedFollowsExist) {
            console.log("You are already following this feed");
            return;
        }
        console.log(`${feedName} feed has succesfully been created by ${userId}`);
        const result = await createFeedFollows(userId, feedResult.id);
    } catch (err) {
        throw err;
    }
}
