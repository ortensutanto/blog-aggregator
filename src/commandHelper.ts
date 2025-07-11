import { setUser } from "./config";

type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = Record<string, CommandHandler>;

export function handlerLogin(cmdName: string, ...args: string[]) {
    if (!args || args.length === 0) {
        throw new Error("Not enough arguments (username)");
    }
    const username = args[0];
    setUser(username);
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handlerFunction = registry[cmdName];
    if (!handlerFunction) {
        console.log(`${cmdName} not found`);
        throw new Error("Command not found");
    }
    handlerFunction(cmdName, ...args);
}
