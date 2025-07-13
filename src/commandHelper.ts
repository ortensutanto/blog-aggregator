import { readConfig, setUser } from "./config";
import { createUser, getUserByName, getUserIdByName, getUsers, resetUsers } from "./lib/db/queries/users";
import { Feed, User } from "./lib/db/schema";
import { addFeed, createFeed, fetchFeed } from "./lib/rss/feed";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

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
        const resetResponse = await resetUsers();
        if (!resetResponse) {
            throw new Error("Unable to reset table");
        }
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

export async function handlerRssFeed(cmdName: string, ...args: string[]) {
    const tempUrl = "https://www.wagslane.dev/index.xml";
    const feedData = await fetchFeed(tempUrl);
    const feedDataStr = JSON.stringify(feedData, null, 2);
    console.log(feedDataStr);
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

    await addFeed(feedName, feedUrl, currUserId);
}

function printFeed(feed: Feed, user: User) {
    console.log(`* ID:            ${feed.id}`);
    console.log(`* Created:       ${feed.createdAt}`);
    console.log(`* Updated:       ${feed.updatedAt}`);
    console.log(`* name:          ${feed.name}`);
    console.log(`* URL:           ${feed.url}`);
    console.log(`* User:          ${user.name}`);
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
