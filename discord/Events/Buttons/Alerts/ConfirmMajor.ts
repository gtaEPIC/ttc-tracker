import Buttons from "../Buttons";
import {ButtonInteraction, MessageEmbed} from "discord.js";
import Alerts, {AlertHandler, AlertType} from "../../../../backend/SQL/Alerts";
import MajorEvents from "../../Commands/Alerts/MajorEvents";

export class ConfirmMajor extends Buttons {
    buttonName: string = "confirmmajor";

    async execute(interaction: ButtonInteraction, args) {
        let uid = args[0];
        let hold = MajorEvents.majorEventHold.filter(e => e.key === uid)[0];
        let line: string = hold.line;
        let situation: string = hold.situation;
        let firstPoint: string = hold.firstPoint;
        let alert: Alerts = await Alerts.new(AlertType.MAJOR, situation, new Date(), null, `<@${interaction.user.id}>`,
            firstPoint, line);
        let embed: MessageEmbed = new MessageEmbed();
        embed.setTitle("Major Event Created");
        embed.setDescription(`A minor event has been created with the following information:\n\n`);
        embed.addField("Line", line);
        embed.addField("Situation", situation);
        if (firstPoint) embed.addField("First Point", firstPoint);
        embed.addField("ID", alert.Alert_ID.toString());
        embed.setColor("#00ff00");
        interaction.reply({
            embeds: [embed],
            ephemeral: true
        }).then();
    }

}