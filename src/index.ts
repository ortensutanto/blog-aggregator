import { CommandsRegistry, handlerLogin, registerCommand, runCommand } from "./commandHelper";
import { readConfig, setUser } from "./config";

function main() {
    let registry: CommandsRegistry = {};
    registerCommand(registry, "login", handlerLogin);

    try {
        const commandName = process.argv[2];
        const commandArgs = process.argv.slice(3);

        if (!commandName || commandName.length === 0) {
            console.error("not enough arguments were provided.");
            process.exit(1)
        }
        runCommand(registry, commandName, ...commandArgs);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        process.exit(1);
    }
}

main();
