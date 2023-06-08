import Buttons from "../Buttons";
import {ButtonInteraction, MessageEmbed} from "discord.js";
import Alerts, {AlertType} from "../../../../backend/SQL/Alerts";
import AddPoint from "../../Commands/Alerts/AddPoint";

export class ConfirmPoint extends Buttons {
    buttonName: string = "confirmPoint";

    async execute(interaction: ButtonInteraction, args) {
        let key: string = args[0];
        let data = AddPoint.pointHold.find((value) => value.key === key);
        let id: string = data.id;
        let update: string = data.update;
        let newSeverity: AlertType = data.newSeverity;
        let alert: Alerts = await Alerts.get(parseInt(id));
        let embed: MessageEmbed = new MessageEmbed();
        if (!alert) {
            embed.setColor("#ff0000");
            embed.setTitle("Event not found");
            embed.setDescription("This event no longer exists. Please make a new one")
            return interaction.reply({embeds: [embed], ephemeral: true})
        }
        await alert.newPoint(update, `<@${interaction.user.id}>`, newSeverity)
        embed.setTitle("Point Added");
        embed.setDescription(`A new point has been added:`);
        embed.addField("ID", id);
        embed.addField("update", update);
        embed.addField("ID", alert.Alert_ID.toString());
        embed.setColor("#00ff00");
        interaction.reply({
            embeds: [embed],
            ephemeral: true
        }).then();
    }

}