import { CommandsRegistry, handlerAddFeed, handlerGetUsers, handlerLogin, handlerPrintFeed, handlerRegister, handlerReset, handlerRssFeed, registerCommand, runCommand } from "./commandHelper";
import { handlerFollow, handlerFollowing, handlerUnfollow } from "./feedFollow";
import { middlewareLoggedIn } from "./middleware";
import { handlerBrowse } from "./posts";

async function main() {
    let registry: CommandsRegistry = {};
    // This is absolutely the wrong way to do this isn't it
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerGetUsers);
    registerCommand(registry, "agg", handlerRssFeed);
    registerCommand(registry, "addfeed", handlerAddFeed);
    registerCommand(registry, "feeds", handlerPrintFeed);
    registerCommand(registry, "follow", handlerFollow);
    registerCommand(registry, "following", handlerFollowing);
    registerCommand(registry, "unfollow", handlerUnfollow);
    registerCommand(registry, "browse", handlerBrowse);

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
