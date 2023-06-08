import Commands from "../Commands";
import {
    ActionRowBuilder,
    SlashCommandBuilder,
    SlashCommandNumberOption,
    SlashCommandStringOption
} from "@discordjs/builders";
import {CommandInteraction, MessageActionRow, MessageButton, MessageEmbed} from "discord.js";
import {MessageButtonStyles} from "discord.js/typings/enums";
import Alerts, {AlertType, AlertTypeNames} from "../../../../backend/SQL/Alerts";
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
        let id = args.id;
        let update: string = args.update;
        if (update.length > 150) {
            let embed: MessageEmbed = new MessageEmbed();
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
        let embed: MessageEmbed = new MessageEmbed();
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
        embed.addField("ID", id);
        embed.addField("Update", update);
        if (args.new_severity !== undefined) embed.addField("New Severity", AlertTypeNames[newSeverity]);
        let messageButton: MessageButton = new MessageButton();
        let holdData = {key: randomUUID(), id: id, update: update, newSeverity: newSeverity};
        messageButton.setCustomId("confirmPoint+=+" + holdData.key);
        messageButton.setLabel("Confirm");
        messageButton.setStyle(MessageButtonStyles.PRIMARY);
        AddPoint.pointHold.push(holdData);
        interaction.reply({
            embeds: [embed],
            components: [new MessageActionRow().addComponents(messageButton)],
            ephemeral: true
        }).then();
    }

}