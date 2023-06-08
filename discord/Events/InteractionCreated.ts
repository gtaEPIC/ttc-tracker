import {Interaction} from "discord.js";
import Commands from "./Commands/Commands";
import Buttons from "./Buttons/Buttons";
import SelectMenu from "./SelectMenu/SelectMenu";
import MinorEvent from "./Commands/Alerts/MinorEvent";
import {ConfirmMinor} from "./Buttons/Alerts/ConfirmMinor";
import AddPoint from "./Commands/Alerts/AddPoint";
import {ConfirmPoint} from "./Buttons/Alerts/ConfirmPoint";
import MajorEvents from "./Commands/Alerts/MajorEvents";
import {ConfirmMajor} from "./Buttons/Alerts/ConfirmMajor";
import Repost from "./Commands/Alerts/Repost";
import SlowZone from "./Commands/Alerts/SlowZone";
import ConfirmSlow from "./Buttons/Alerts/ConfirmSlow";
import Raw from "./Commands/Alerts/Raw";
import {NTAS} from "./Commands/Tracker/NTAS";
import {UpdateNTAS} from "./Buttons/Tracker/UpdateNTAS";

export const commands: Array<Commands> = [
    new MinorEvent(),
    new AddPoint(),
    new MajorEvents(),
    new Repost(),
    new SlowZone(),
    new Raw(),
    new NTAS(),
];


export const buttons: Array<Buttons> = [
    new ConfirmMinor(),
    new ConfirmPoint(),
    new ConfirmMajor(),
    new ConfirmSlow(),
    new UpdateNTAS()
];
export const selectMenus: Array<SelectMenu> = [
];

// export const modals: Array<Modal> = [];

export default function (interaction: Interaction) {
    // console.log(interaction)
    if (interaction.isCommand()) {
        const args = {}
        let options = interaction.options.data
        if (options.length > 0) {
            for (let option of options) {
                args[option.name] = option.value
            }
        }
        for (let command of commands) {
            if (command.commandName === interaction.commandName) command.execute(interaction, args);
        }
    }else if (interaction.isButton()) {
        let args = interaction.customId.split("+=+");
        let name = interaction.customId = args.shift();
        for (let button of buttons) {
            if (button.buttonName === name) button.execute(interaction, args);
        }
    }else if (interaction.isSelectMenu()) {
        let args = interaction.customId.split("+=+");
        let name = interaction.customId = args.shift();
        for (let selectMenu of selectMenus) {
            if (selectMenu.selectName === name) selectMenu.execute(interaction, args);
        }
    // }else if (interaction.isContextMenu()) {

    }
}