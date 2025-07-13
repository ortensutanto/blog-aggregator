import { CommandHandler } from "./commandHelper";
import { readConfig } from "./config";
import { getUserByName } from "./lib/db/queries/users";
import { User } from "./lib/db/schema";

export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]): Promise <void> => {
        const config = readConfig();
        if (!config.currentUserName) {
            throw new Error("User is not logged in");
        }
        const user = await getUserByName(config.currentUserName);
        if (!user) {
            throw new Error(`${config.currentUserName} does not exist`);
        }
        await handler(cmdName, user, ...args);
    }
}
