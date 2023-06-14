import Commands from "../Commands";
import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";
import {AlertHandler} from "../../../../SQL/Alerts";

export default class Repost extends Commands {
    commandName: string = "repost";

    createCommand(): object {
        return new SlashCommandBuilder()
            .setName("repost")
            .setDescription("Repost the live alerts list").toJSON();
    }

    execute(interaction: CommandInteraction, args) {
        try {
            let oldMessage = AlertHandler.getMessage();
            AlertHandler.init().then();
            oldMessage.delete().then();
            interaction.reply({content: "Reposted alerts list", ephemeral: true}).then();
        } catch (e) {
            console.error(e);
            interaction.reply({
                content: "Something went wrong. Please try again. (" + e.message + ")",
                ephemeral: true
            }).catch(console.error);
        }
    }

}