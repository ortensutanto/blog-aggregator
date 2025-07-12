import { CommandsRegistry, handlerGetUsers, handlerLogin, handlerRegister, handlerReset, handlerRssFeed, registerCommand, runCommand } from "./commandHelper";
import { readConfig, setUser } from "./config";

async function main() {
    let registry: CommandsRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerGetUsers);
    registerCommand(registry, "agg", handlerRssFeed);

    try {
        const commandName = process.argv[2];
        const commandArgs = process.argv.slice(3);

        if (!commandName || commandName.length === 0) {
            console.error("not enough arguments were provided.");
            process.exit(1)
        }
        await runCommand(registry, commandName, ...commandArgs);
        process.exit(0);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        process.exit(1);
    }

}

main();
