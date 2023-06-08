import {Guild} from "discord.js";
import {createCommands} from "../DiscordExtras";

export default async function (guild: Guild) {
    await createCommands(guild);
}