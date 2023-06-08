import {Guild} from "discord.js";
import {REST} from "@discordjs/rest";
import {commands} from "./Events/InteractionCreated";
import {client} from "../index";
import {Routes} from "discord-api-types/v9";


export async function createCommands(guild: Guild): Promise<Boolean> {
    const cmd = commands.map(command => command.createCommand())

    const botID = process.env.DISCORD_TOKEN;
    const CLIENT_ID = client.user.id;
    const rest = new REST({
        version: '9'
    }).setToken(botID);
    try {
        if (!guild.id) {
            await rest.put(
                Routes.applicationCommands(CLIENT_ID), {
                    body: cmd
                },
            );
            console.log('Successfully registered application commands globally');
        } else {
            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, guild.id), {
                    body: cmd
                },
            );
            console.log('Successfully registered application commands for development guild');
        }
    } catch (error) {
        if (error) console.error(error);
        return false;
    }
    return true;
}