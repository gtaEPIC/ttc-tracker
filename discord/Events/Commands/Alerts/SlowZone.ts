import Commands from "../Commands";
import {SlashCommandBuilder, SlashCommandStringOption} from "@discordjs/builders";
import {MessageActionRow, MessageButton, MessageEmbed} from "discord.js";
import {randomUUID} from "crypto";
import {MessageButtonStyles} from "discord.js/typings/enums";

export default class SlowZone extends Commands {
    commandName: string = "slowzone";

    createCommand(): object {
        return new SlashCommandBuilder()
            .setName("slowzone")
            .setDescription("Create a slow zone alert")
            .addStringOption(new SlashCommandStringOption()
                .setName("line")
                .setDescription("The line that the slow zone is on")
                .setRequired(true))
            .addStringOption(new SlashCommandStringOption()
                .setName("location")
                .setDescription("The location of the slow zone")
                .setRequired(true))
            .toJSON();
    }

    static slowHolds: { key: string, line: string, location: string}[] = [];

    execute(interaction, args) {
        let line = args.line;
        if (line.length > 50) {
            let embed: MessageEmbed = new MessageEmbed();
            embed.setColor("#ff0000");
            embed.setTitle("Line too long.");
            embed.setDescription("Please make sure your line is less than 50 characters.");
            let demo = `\`\`\`diff\n! ${line.substring(0, 50)}\n- ${line.substring(50)}\`\`\``
            embed.addFields({name: "Length Comparison", value: demo});
            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
        let location = args.location;
        if (location.length > 150) {
            let embed: MessageEmbed = new MessageEmbed();
            embed.setColor("#ff0000");
            embed.setTitle("Location too long.");
            embed.setDescription("Please make sure your location is less than 150 characters.");
            let demo = `\`\`\`diff\n! ${location.substring(0, 150)}\n- ${location.substring(150)}\`\`\``
            embed.addFields({name: "Length Comparison", value: demo});
            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
        // 30 minutes in milliseconds = 1800000
        let embed = new MessageEmbed();
        embed.setColor("#ffff00");
        embed.setTitle("Confirm slow zone");
        embed.setDescription(`Please confirm that you want to create a slow zone with the following information\n`);
        embed.addField("Line", line);
        embed.addField("Location", location);
        embed.addField("Duration", "30 minutes (can't be changed)");
        let toHold = {key: randomUUID(), line: line, location: location};
        SlowZone.slowHolds.push(toHold);
        let messageButton = new MessageButton()
            .setCustomId('confirmslow+=+' + toHold.key)
            .setLabel('Confirm')
            .setStyle(MessageButtonStyles.PRIMARY);
        interaction.reply({embeds: [embed], components: [new MessageActionRow().addComponents(messageButton)], ephemeral: true}).then();
    }

}