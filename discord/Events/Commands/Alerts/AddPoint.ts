import Commands from "../Commands";
import {SlashCommandBuilder, SlashCommandStringOption} from "@discordjs/builders";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder} from "discord.js";
import Alerts, {AlertType, AlertTypeNames} from "../../../../SQL/Alerts";
import {randomUUID} from "crypto";

export default class AddPoint extends Commands {
    commandName: string = "addpoint";

    createCommand(): object {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Add a point to an active event occurring.")
            .addStringOption(new SlashCommandStringOption()
                .setName("id")
                .setDescription("The ID of the event you want to add a point.")
                .setRequired(true))
            .addStringOption(new SlashCommandStringOption()
                .setName("update")
                .setDescription("Update to the situation.")
                .setRequired(true))
            .addStringOption(new SlashCommandStringOption().setName("new_severity")
                .setDescription("The new severity of the event.")
                .setRequired(false)
                .addChoices({name: "Cleared", value: AlertType.CLEARED.toString()},
                    {name: "Minor", value: AlertType.MINOR.toString()},
                    {name: "Major", value: AlertType.MAJOR.toString()}))
            .toJSON();
    }

    static pointHold: { key: string, id: string, update: string, newSeverity: AlertType }[] = [];

    async execute(interaction: CommandInteraction, args) {
        try {
            let id = args.id;
            let update: string = args.update;
            if (update.length > 150) {
                let embed: EmbedBuilder = new EmbedBuilder();
                embed.setColor("#ff0000");
                embed.setTitle("Update too long.");
                embed.setDescription("Please make sure your update is less than 150 characters.");
                let demo = `\`\`\`diff\n! ${update.substring(0, 150)}\n- ${update.substring(150)}\`\`\``
                embed.addFields({name: "Length Comparison", value: demo});
                return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
            }
            let newSeverity: AlertType = <AlertType>parseInt(args.new_severity);
            let alert: Alerts = await Alerts.get(parseInt(id));
            let embed: EmbedBuilder = new EmbedBuilder();
            if (!alert) {
                embed.setColor("#ff0000");
                embed.setTitle("Event not found.")
                embed.setDescription("Please make sure you put in a valid ID")
                return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
            }
            embed.setColor("#ffff00");
            embed.setTitle("Confirm new point")
            embed.setDescription(`Please confirm that you want to create a minor event with the following information\n` +
                `Misuse of this command may result in a ban or a ban from these commands.\n` +
                `Please make sure there is no cuss words and that this information is correct.\n` +
                `If you need to change the information, click \`Dismiss this message\` and then run the command again.`);
            embed.addFields({name: "ID", value: id});
            embed.addFields({name: "Update", value: update});
            if (args.new_severity !== undefined) embed.addFields({
                name: "New Severity",
                value: AlertTypeNames[newSeverity]
            });
            let messageButton: ButtonBuilder = new ButtonBuilder();
            let holdData = {key: randomUUID(), id: id, update: update, newSeverity: newSeverity};
            messageButton.setCustomId("confirmPoint+=+" + holdData.key);
            messageButton.setLabel("Confirm");
            messageButton.setStyle(ButtonStyle.Primary);
            AddPoint.pointHold.push(holdData);
            let actionRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>();
            actionRow.addComponents(messageButton);
            interaction.reply({
                embeds: [embed],
                components: [actionRow],
                ephemeral: true,
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