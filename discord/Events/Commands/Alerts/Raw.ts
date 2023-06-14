import {SlashCommandBuilder} from "@discordjs/builders";
import Commands from "../Commands";
import {CommandInteraction} from "discord.js";
import axios from "axios";

export default class Raw extends Commands {
    commandName: string = "raw";
    createCommand(): object {
        return new SlashCommandBuilder()
            .setName("raw")
            .setDescription("Raw alert data").toJSON();
    }
    async execute(interaction: CommandInteraction, args) {
        try {
            let data = JSON.stringify((await axios.get("https://alerts.ttc.ca/api/alerts/list")).data, null, 3);
            if (data.length > 1987) {
                await interaction.reply({files: [{name: "data.json", attachment: Buffer.from(data)}]})
            } else {
                await interaction.reply({content: "```json\n" + data + "```"})
            }
        } catch (e) {
            console.error(e);
            interaction.reply({
                content: "Something went wrong. Please try again. (" + e.message + ")",
                ephemeral: true
            }).catch(console.error);
        }
    }
}