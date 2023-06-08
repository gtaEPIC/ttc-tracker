import {SlashCommandBuilder} from "@discordjs/builders";
import Commands from "../Commands";
import {CommandInteraction, MessageEmbed} from "discord.js";
import {AlertHandler} from "../../../../backend/SQL/Alerts";
import axios from "axios";

export default class Raw extends Commands {
    commandName: string = "raw";
    createCommand(): object {
        return new SlashCommandBuilder()
            .setName("raw")
            .setDescription("Raw alert data").toJSON();
    }
    async execute(interaction: CommandInteraction, args) {
        let data = JSON.stringify((await axios.get("https://alerts.ttc.ca/api/alerts/list")).data, null, 3);
        if (data.length > 1987) {
            await interaction.reply({files: [{name: "data.json", attachment: Buffer.from(data)}]})
        }else{
            await interaction.reply({content: "```json\n" + data + "```"})
        }
    }
}