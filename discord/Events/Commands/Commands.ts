import {CommandInteraction} from "discord.js";

export default abstract class Commands {
    abstract commandName: string;

    abstract execute(interaction: CommandInteraction, args);
    abstract createCommand(): object;

}
