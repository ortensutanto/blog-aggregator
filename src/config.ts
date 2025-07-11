import fs from "fs";
import os from "os";
import path from "path";

type Config = {
    dbUrl: string;
    currentUserName: string;
}

function getConfigFilePath(): string {
    return path.join(os.homedir(), ".gatorconfig.json");
}

function validateConfig(rawConfig: any): Config {
    const parsedConfig = JSON.parse(rawConfig);
    if ("db_url" in parsedConfig) {
        return {
            dbUrl: parsedConfig.db_url,
            currentUserName: parsedConfig.current_user_name
        }
    }
    // Not sure what to return here, just putting this temporarily.
    return {dbUrl: "", currentUserName: ""};
}

export function readConfig(): Config {
    const configFile = fs.readFileSync(getConfigFilePath(), 'utf-8');
    const parsedConfig = validateConfig(configFile);

    if (parsedConfig.dbUrl !== "") {
        return parsedConfig;
    }
    return {dbUrl: "", currentUserName: ""};
}

function writeConfig(cfg: Config): void {
    const writtenConfig = `{
    "db_url": "${cfg.dbUrl}",
    "current_user_name": "${cfg.currentUserName}"
}`
    fs.writeFileSync(getConfigFilePath(), writtenConfig, 'utf-8');
}

export function setUser(userName: string) {
    const currentConfig = readConfig();
    const newConfig: Config = {
        dbUrl: currentConfig.dbUrl,
        currentUserName: userName
    };
    // console.log(newConfig);
    writeConfig(newConfig);
}
