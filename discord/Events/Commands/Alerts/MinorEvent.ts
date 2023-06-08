import Commands from "../Commands";
import {
    ActionRowBuilder,
    SlashCommandBuilder,
    SlashCommandNumberOption,
    SlashCommandStringOption
} from "@discordjs/builders";
import {CommandInteraction, MessageActionRow, MessageButton, MessageEmbed} from "discord.js";
import {MessageButtonStyles} from "discord.js/typings/enums";
import {randomUUID} from "crypto";

export default class MinorEvent extends Commands {
    commandName: string = "minorevent";

    static minorEventHold: { key: string, line: string, situation: string, firstPoint: string }[] = [];


    createCommand(): object {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Add a minor event alert in the Active Alerts.")
            .addStringOption(new SlashCommandStringOption()
                .setName("line")
                .setDescription("The line that the event is happening on.")
                .setRequired(true))
            .addStringOption(new SlashCommandStringOption()
                .setName("situation")
                .setDescription("The situation that is happening.")
                .setRequired(true))
            .addStringOption(new SlashCommandStringOption()
                .setName("first_point")
                .setDescription("More information about the situation.")
                .setRequired(false))
            .toJSON();
    }

    execute(interaction: CommandInteraction, args) {
        let line: string = args.line;
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
        let situation: string = args.situation;
        if (situation.length > 150) {
            let embed: MessageEmbed = new MessageEmbed();
            embed.setColor("#ff0000");
            embed.setTitle("Situation too long.");
            embed.setDescription("Please make sure your situation is less than 150 characters.");
            let demo = `\`\`\`diff\n! ${situation.substring(0, 150)}\n- ${situation.substring(150)}\`\`\``
            embed.addFields({name: "Length Comparison", value: demo});
            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
        let firstPoint: string = args.first_point;
        if (firstPoint && firstPoint.length > 150) {
            let embed: MessageEmbed = new MessageEmbed();
            embed.setColor("#ff0000");
            embed.setTitle("First Point too long.");
            embed.setDescription("Please make sure your first point is less than 150 characters.");
            let demo = `\`\`\`diff\n! ${firstPoint.substring(0, 150)}\n- ${firstPoint.substring(150)}\`\`\``
            embed.addFields({name: "Length Comparison", value: demo});
            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
        let embed: MessageEmbed = new MessageEmbed();
        embed.setTitle("Creating a Minor Event");
        embed.setDescription(`Please confirm that you want to create a minor event with the following information\n` +
            `Misuse of this command may result in a ban or a ban from these commands.\n` +
            `Please make sure there is no cuss words and that this information is correct.\n` +
            `If you need to change the information, click \`Dismiss this message\` and then run the command again.`);
        embed.addField("Line", line);
        embed.addField("Situation", situation);
        if (firstPoint) embed.addField("First Point", firstPoint);
        embed.setColor("#ffff00");
        let holding = {key: randomUUID(), line: line, situation: situation, firstPoint: firstPoint}
        MinorEvent.minorEventHold.push(holding);
        // Add a button to confirm the creation of the minor event.
        let messageButton: MessageButton = new MessageButton();
        messageButton.setCustomId("confirmminor+=+" + holding.key);
        messageButton.setLabel("Confirm");
        messageButton.setStyle(MessageButtonStyles.PRIMARY);
        interaction.reply({
            embeds: [embed],
            components: [new MessageActionRow().addComponents(messageButton)],
            ephemeral: true
        }).then();
    }

}