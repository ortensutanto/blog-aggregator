import { time } from "console";
import { readConfig, setUser } from "./config";
import { getFeeds } from "./lib/db/queries/feeds";
import { resetTables } from "./lib/db/queries/reset";
import { createUser, getUserByName, getUserIdByName, getUserNameById, getUsers } from "./lib/db/queries/users";
import { Feed, User } from "./lib/db/schema";
import { addFeed, fetchFeed } from "./lib/rss/feed";
import { scrapeFeeds } from "./lib/rss/aggregate";
import { parse } from "path";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (!args || args.length === 0) {
        throw new Error("Not enough arguments (username)");
    }
    const username = args[0];
    try {
        const userExists = await getUserByName(username);
        if (!userExists) {
            throw new Error("Username doesn't exist in database");
        }
        setUser(username);
        console.log("User has logged in");
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        throw err;
    }
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (!args || args.length === 0) {
        throw new Error("Not enough arguments (username)");
    }
    const username = args[0];
    try {
        const userExists = await getUserByName(username);
        if (userExists) {
            throw new Error("User already exists!");
        }
        const createRespone = await createUser(username);
        setUser(username);
        console.log("User has been created");
        console.log(createRespone);
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        throw err;
    }
}

export async function handlerReset(cmdName: string, ...args: string[]) {
    try {
        await resetTables();
        // No response  since deleting multiple tables
        // if (!resetResponse) {
        //     throw new Error("Unable to reset table");
        // }
        console.log("Table content has been deleted");
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.log(err.message);
        }
        throw err;
    }
}

export async function handlerGetUsers(cmdName: string, ...args: string[]) {
    try {
        const registeredUsers = await getUsers();
        const currentUser = readConfig().currentUserName;

        for (const user of registeredUsers) {
            console.log(`* ${user.name} ${user.name === currentUser ? "(current)": ""}`);
        }
    } catch (err: unknown) {
        // Not going to log since it doubles it?
        throw err;
    }
}

// export async function handlerRssFeed(cmdName: string, ...args: string[]) {
//     const url = args[0];
//     const feedData = await fetchFeed(url);
//     const feedDataStr = JSON.stringify(feedData, null, 2);
//     console.log(feedDataStr);
// }

function parseDuration(duration: string) {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = duration.match(regex);
    console.log(duration);
    if (!match) {
        return -1;
    }
    const time: number = parseInt(match[1]);
    const format = match[2];

    if (format === "ms") {
        return time;
    } else if (format === "s") {
        return time * 1000;
    } else if (format === "m") {
        return time * 1000 * 60;
    } else {
        return time * 1000 * 60 * 60;
    }
}

export async function handlerRssFeed(cmdName: string, time_between_reqs: string) {
    const duration = parseDuration(time_between_reqs);
    console.log(duration);
    if (duration === -1) {
        throw new Error("Invalid time between requests");
    }
    console.log(`Collecting feeds every ${time_between_reqs}`);
    scrapeFeeds().catch();

    const interval = setInterval(() => {
        scrapeFeeds().catch();
    }, duration);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });
}
export async function handlerAddFeed(cmdName: string, ...args: string[]) {
    if (args.length !== 2) {
        throw new Error("Not enough arguments");
    }
    const currUserName = readConfig().currentUserName;

    const currUserId = (await getUserIdByName(currUserName)).id;
    if (!currUserId) {
        throw new Error("User does not exist");
    }
    const feedName = args[0];
    const feedUrl = args[1];

    const result = await addFeed(feedName, feedUrl, currUserId);
    console.log(`Feed Name: ${feedName}`);
    console.log(`User Name: ${currUserName}`);
}

function printFeed(feed: Feed, user: User) {
    console.log(`* ID:            ${feed.id}`);
    console.log(`* Created:       ${feed.createdAt}`);
    console.log(`* Updated:       ${feed.updatedAt}`);
    console.log(`* name:          ${feed.name}`);
    console.log(`* URL:           ${feed.url}`);
    console.log(`* User:          ${user.name}`);
}

export async function handlerPrintFeed() {
    const feeds: Feed[] = await getFeeds();  
    for (const feed of feeds) {
        const user = await getUserNameById(feed.userId);
        if (!user) {
            continue;
        }
        printFeed(feed, user);
    }
}

export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handlerFunction = registry[cmdName];
    if (!handlerFunction) {
        console.log(`${cmdName} not found`);
        throw new Error("Command not found");
    }
    await handlerFunction(cmdName, ...args);
}
