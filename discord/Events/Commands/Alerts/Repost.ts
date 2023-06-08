import Commands from "../Commands";
import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";
import {AlertHandler} from "../../../../backend/SQL/Alerts";
import {client} from "../../../../backend";

export default class Repost extends Commands {
    commandName: string = "repost";

    createCommand(): object {
        return new SlashCommandBuilder()
            .setName("repost")
            .setDescription("Repost the live alerts list").toJSON();
    }

    execute(interaction: CommandInteraction, args) {
        let oldMessage = AlertHandler.getMessage();
        AlertHandler.init().then();
        oldMessage.delete().then();
        interaction.reply({content: "Reposted alerts list", ephemeral: true}).then();
    }

}