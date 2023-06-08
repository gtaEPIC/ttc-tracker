import Buttons from "../Buttons";
import {ButtonInteraction, Message, MessageButton} from "discord.js";
import {Garbage, NTAS} from "../../Commands/Tracker/NTAS";

export class UpdateNTAS extends Buttons {
    buttonName: string = "update-ntas";

    execute(interaction: ButtonInteraction, args) {
        let message: Message = <Message>interaction.message;
        let ntas: Garbage = NTAS.activeMessages[message.id];
        if (ntas) {
            NTAS.updateMessage(ntas.interaction, ntas.station, ntas.stationCode, message, 0).then();
            interaction.reply({content: "Updated", ephemeral: true}).then();
        }else{
            interaction.reply({
                content: "NTAS data not found. Please use the command instead.",
                 ephemeral: true
            }).then();
        }
    }

    static discordButton(): MessageButton {
        return new MessageButton()
            .setCustomId("update-ntas")
            .setLabel("Update")
            .setStyle("PRIMARY");
    }

}