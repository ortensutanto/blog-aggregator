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
    if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
        throw new Error("db_url is required in config file");
    }
    if (!rawConfig.current_user_name || typeof rawConfig.current_user_name !== "string") {
        throw new Error("current_user_name is required in config file");
    }

    const config: Config = {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name
    };
    return config;
}

export function readConfig(): Config {
    const configFile = fs.readFileSync(getConfigFilePath(), 'utf-8');
    const rawConfig = JSON.parse(configFile);
    return validateConfig(rawConfig);
}

function writeConfig(cfg: Config): void {
    const rawConfig = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName
    };

    const writtenConfig = JSON.stringify(rawConfig, null, );
    fs.writeFileSync(getConfigFilePath(), writtenConfig, 'utf-8');
}

export function setUser(userName: string) {
    const currentConfig = readConfig();
    currentConfig.currentUserName = userName;
    writeConfig(currentConfig);
}
