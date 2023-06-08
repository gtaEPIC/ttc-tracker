import {createCommands} from "../DiscordExtras";
import {client} from "../../index";
require("dotenv").config();

export default async function () {
    console.log("Logged in as " + client.user.tag);
    client.guilds.cache.forEach(await (async (guild) => {
        await createCommands(guild);
    }))
}