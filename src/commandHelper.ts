import { readConfig, setUser } from "./config";
import { createUser, getUserByName, getUsers, resetUsers } from "./lib/db/queries/users";

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
