import { readConfig, setUser } from "./config";

function main() {
    setUser("Orten");
    console.log(readConfig());
}

main();
