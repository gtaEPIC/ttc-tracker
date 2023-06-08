import {ButtonInteraction} from "discord.js";

export default abstract class Buttons {
    abstract buttonName: string;

    abstract execute(interaction: ButtonInteraction, args);
    //abstract createCommand(): object;

}