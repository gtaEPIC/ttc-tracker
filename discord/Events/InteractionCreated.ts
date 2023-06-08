import {Interaction, Modal} from "discord.js";
import Commands from "./Commands/Commands";
import Buttons from "./Buttons/Buttons";
import SelectMenu from "./SelectMenu/SelectMenu";
import SelectIntroductions from "./SelectMenu/SelectIntroductions";
import SaySomething from "./Commands/SaySomething";
import SelectRunSelections from "./SelectMenu/SelectRunSelections";
import SignRun from "./Buttons/SignRun";
import UnSignRun from "./Buttons/UnSignRun";
import {Login} from "./Commands/Login";
import {CheckWarnings} from "./Commands/CheckWarnings";
import Stats from "./Commands/Stats";
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

/*
Music Bot Commands

import Play from "./Commands/Music/Play";
import PlayNext from "./Commands/Music/PlayNext";
import Pause from "./Commands/Music/Pause";
import Resume from "./Commands/Music/Resume";
import Loop from "./Commands/Music/Loop";
import Skip from "./Commands/Music/Skip";
import Stop from "./Commands/Music/Stop";
import Rewind from "./Commands/Music/Rewind";
import NowPlaying from "./Commands/Music/NowPlaying";
import QueueCommand from "./Commands/Music/QueueCommand";
import HistoryCommand from "./Commands/Music/HistoryCommand";
import ClearQueue from "./Commands/Music/ClearQueue";
import PreviousButton from "./Buttons/Music/PreviousButton";
import PlayButton from "./Buttons/Music/PlayButton";
import PauseButton from "./Buttons/Music/PauseButton";
import SkipButton from "./Buttons/Music/SkipButton";
import StopButton from "./Buttons/Music/StopButton";
import QueueButton from "./Buttons/Music/QueueButton";
import HistoryButton from "./Buttons/Music/HistoryButton";
import NowPlayingButton from "./Buttons/Music/NowPlayingButton";
import LoopMenu from "./SelectMenu/Music/LoopMenu";
import PlayNextButton from "./Buttons/Music/PlayNextButton";
import PlayLastButton from "./Buttons/Music/PlayLastButton";
import SetChannel from "./Commands/Music/SetChannel";
import RollDice from "./Commands/Random/RollDice";
import ReRoll from "./Buttons/Random/ReRoll";
import CounterButton from "./Buttons/Random/Counter";
import Counter from "./Commands/Random/Counter";

 */

export const commands: Array<Commands> = [
    new SaySomething(),
    new Login(),
    new CheckWarnings(),
    new Stats(),
    new MinorEvent(),
    new AddPoint(),
    new MajorEvents(),
    new Repost(),
    new SlowZone(),
    new Raw(),
    new NTAS(),
];


export const buttons: Array<Buttons> = [
    new SignRun(),
    new UnSignRun(),
    new ConfirmMinor(),
    new ConfirmPoint(),
    new ConfirmMajor(),
    new ConfirmSlow(),
    new UpdateNTAS()
];
export const selectMenus: Array<SelectMenu> = [
    new SelectIntroductions(),
    new SelectRunSelections()
];

export const modals: Array<Modal> = [];

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
    }else if (interaction.isContextMenu()) {

    }
}