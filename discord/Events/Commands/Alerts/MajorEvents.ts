import Commands from "../Commands";
import {SlashCommandBuilder, SlashCommandStringOption} from "@discordjs/builders";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder} from "discord.js";
import {randomUUID} from "crypto";

export default class MajorEvents extends Commands {
    commandName: string = "majorevent";

    static majorEventHold: { key: string, line: string, situation: string, firstPoint: string }[] = [];

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
        try {
            let line: string = args.line;
            if (line.length > 50) {
                let embed: EmbedBuilder = new EmbedBuilder();
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
                let embed: EmbedBuilder = new EmbedBuilder();
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
                let embed: EmbedBuilder = new EmbedBuilder();
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
            let embed: EmbedBuilder = new EmbedBuilder();
            embed.setTitle("Creating a Major Event");
            embed.setDescription(`Please confirm that you want to create a minor event with the following information\n` +
                `Misuse of this command may result in a ban or a ban from these commands.\n` +
                `Please make sure there is no cuss words and that this information is correct.\n` +
                `If you need to change the information, click \`Dismiss this message\` and then run the command again.`);
            embed.addFields({name: "Line", value: line});
            embed.addFields({name: "Situation", value: situation});
            if (firstPoint) embed.addFields({name: "First Point", value: firstPoint});
            embed.setColor("#ffff00");
            // Add a button to confirm the creation of the minor event.
            let holding = {key: randomUUID(), line: line, situation: situation, firstPoint: firstPoint}
            MajorEvents.majorEventHold.push(holding);
            let messageButton: ButtonBuilder = new ButtonBuilder();
            messageButton.setCustomId("confirmmajor+=+" + holding.key);
            messageButton.setLabel("Confirm");
            messageButton.setStyle(ButtonStyle.Primary);
            interaction.reply({
                embeds: [embed],
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(messageButton)],
                ephemeral: true
            }).then();
        } catch (e) {
            console.error(e);
            interaction.reply({
                content: "Something went wrong. Please try again. (" + e.message + ")",
                ephemeral: true
            }).catch(console.error);
        }
    }

}