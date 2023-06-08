import {Client, IntentsBitField} from "discord.js";
import SQLSetup from "./SQL/Setup/SQLSetup";
import OnReady from "./discord/Events/OnReady";
import GuildCreate from "./discord/Events/GuildCreate";
import InteractionCreated from "./discord/Events/InteractionCreated";
import {AlertHandler} from "./SQL/Alerts";
import {NTAS} from "./discord/Events/Commands/Tracker/NTAS";

export const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildVoiceStates
    ]
})

SQLSetup().then(() => {
    console.log("Done");
});

client.on("ready", OnReady);
client.on("guildCreate", GuildCreate);
client.on("interactionCreate", InteractionCreated);
// client.on("voiceStateUpdate", VCJoin)
client.login(process.env.DISCORD_TOKEN).then();

AlertHandler.init().then(() => {
    console.log("Alerts initialized")
    setInterval(() => {
        AlertHandler.update().then();
    }, 30000);
});
setInterval(NTAS.update, 20000);