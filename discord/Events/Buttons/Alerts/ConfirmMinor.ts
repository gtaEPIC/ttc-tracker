import Buttons from "../Buttons";
import {ButtonInteraction, MessageEmbed} from "discord.js";
import Alerts, {AlertType} from "../../../../backend/SQL/Alerts";
import MajorEvents from "../../Commands/Alerts/MajorEvents";
import MinorEvent from "../../Commands/Alerts/MinorEvent";

export class ConfirmMinor extends Buttons {
    buttonName: string = "confirmminor";

    async execute(interaction: ButtonInteraction, args) {
        let uid = args[0];
        let hold = MinorEvent.minorEventHold.filter(e => e.key === uid)[0];
        let line: string = hold.line;
        let situation: string = hold.situation;
        let firstPoint: string = hold.firstPoint;
        let alert: Alerts = await Alerts.new(AlertType.MINOR, situation, new Date(), null, `<@${interaction.user.id}>`,
            firstPoint, line);
        let embed: MessageEmbed = new MessageEmbed();
        embed.setTitle("Minor Event Created");
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