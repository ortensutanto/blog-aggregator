import { XMLParser } from "fast-xml-parser";

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
