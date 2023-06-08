import Buttons from "../Buttons";
import {ButtonInteraction, MessageEmbed} from "discord.js";
import SlowZone from "../../Commands/Alerts/SlowZone";
import Alerts, {AlertType} from "../../../../backend/SQL/Alerts";

export default class ConfirmSlow extends Buttons {
    buttonName: string = "confirmslow";

    execute(interaction: ButtonInteraction, args) {
        let key: string = args[0];
        let data = SlowZone.slowHolds.find((value) => value.key === key);
        console.log(data, SlowZone.slowHolds)
        let line: string = data.line;
        let location: string = data.location;
        let embed = new MessageEmbed();
        embed.setColor("#00ff00");
        embed.setTitle("Slow zone created");
        embed.setDescription(`A slow zone has been created with the following information:\n`);
        embed.addField("Line", line);
        embed.addField("Location", location);
        embed.addField("Duration", "30 minutes (can't be changed)");
        Alerts.new(AlertType.CONSTRUCTION, location, new Date(), new Date(Date.now() + 1800000), `<@${interaction.user.id}>`,
            null, line).then();
        interaction.reply({embeds: [embed], ephemeral: true}).then();
    }

}