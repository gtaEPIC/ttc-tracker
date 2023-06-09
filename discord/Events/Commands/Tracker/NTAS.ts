import {SlashCommandBuilder, SlashCommandStringOption} from "@discordjs/builders";
import Commands from "../Commands";
import {CommandInteraction, Emoji, Guild, Message, ActionRowBuilder, EmbedBuilder, ButtonBuilder} from "discord.js";
import {DiscordFetchHelpers} from "../../../DiscordFetchHelper";
import {client} from "../../../../index";
import axios from "axios";
import {UpdateNTAS} from "../../Buttons/Tracker/UpdateNTAS";

export interface Garbage {
    interaction: CommandInteraction, station: string, stationCode: string[], message: Message, count: number
}

export class NTAS extends Commands {
    commandName: string = "ntas";
    static activeMessages: { [message: string]: Garbage } = {};
    static deadMessages: { [message: string]: Garbage } = {};

    stationCodes = [
        {name: "Kennedy", value: "14947,13865"},
        {name: "Warden", value: "13732,13731"},
        {name: "Victoria Park", value: "13734,13733"},
        {name: "Main Street", value: "13735,13736"},
        {name: "Woodbine", value: "13738,13737"},
        {name: "Coxwell", value: "13739,13740"},
        {name: "Greenwood", value: "13742,13741"},
        {name: "Donlands", value: "13743,13744"},
        {name: "Pape", value: "13746,13745"},
        {name: "Chester", value: "13748,13747"},
        {name: "Broadview", value: "13749,13750"},
        {name: "Castle Frank", value: "13752,13751"},
        {name: "Sherbourne", value: "13753,13754"},
        {name: "Bloor-Yonge", value: "13756,13755,13859,13860"},
        {name: "Bay", value: "13757,13758"},
        {name: "St George", value: "13856,13855,13857,13858"},
        {name: "Spadina", value: "13854,13853,13852,13851"},
        {name: "Bathurst", value: "13760,13759"},
        {name: "Christie", value: "13761,13762"},
        {name: "Ossington", value: "13764,13763"},
        {name: "Dufferin", value: "13765,13766"},
        {name: "Lansdowne", value: "13768,13767"},
        {name: "Dundas West", value: "13769,13770"},
        {name: "Keele", value: "13772,13771"},
        {name: "High Park", value: "13773,13774"},
        {name: "Runnymede", value: "13776,13775"},
        {name: "Jane", value: "13777,13778"},
        {name: "Old Mill", value: "13780,13779"},
        {name: "Royal York", value: "13781,13782"},
        {name: "Islington", value: "13784,13783"},
        {name: "Kipling", value: "13785,14948"},
        {name: "Sheppard-Yonge", value: "13859,13860,13862,13861"},
        {name: "Bayview", value: "13844,13843"},
        {name: "Bessarion", value: "13845,13846"},
        {name: "Leslie", value: "13848,13847"},
        {name: "Don Mills", value: "14949,14109"},
        {name: "Finch", value: "14944,14111"},
        {name: "North York Centre", value: "13790,13789"},
        {name: "York Mills", value: "13791,13792"},
        {name: "Lawrence", value: "13794,13793"},
        {name: "Eglinton", value: "13796,13795"},
        {name: "Davisville", value: "13797,13796"},
        {name: "St Clair", value: "13800,13799"},
        {name: "Summerhill", value: "13801,13802"},
        {name: "Rosedale", value: "13804,13803"},
        {name: "Wellesley", value: "13805,13806"},
        {name: "College", value: "13808,13807"},
        {name: "Dundas", value: "13809,13810"},
        {name: "Queen", value: "13812,13811"},
        {name: "King", value: "13813,13814"},
        {name: "Union", value: "13816,13815"},
        {name: "St Andrew", value: "13817,13818"},
        {name: "Osgoode", value: "13820,13819"},
        {name: "St Patrick", value: "13821,13822"},
        {name: "Queen's Park", value: "13824,13823"},
        {name: "Museum", value: "13825,13826"},
        {name: "Dupont", value: "13828,13827"},
        {name: "St Clair West", value: "13829,13830"},
        {name: "Eglinton West", value: "13832,13831"},
        {name: "Glencairn", value: "13833,13834"},
        {name: "Lawrence West", value: "13836,13835"},
        {name: "Yorkdale", value: "13837,13838"},
        {name: "Wilson", value: "13840,13839"},
        {name: "Sheppard West", value: "14945,14110"},
        {name: "Downsview Park", value: "15664,15665"},
        {name: "Finch West", value: "15659,15658"},
        {name: "York University", value: "15666,15667"},
        {name: "Pioneer Village", value: "15656,15657"},
        {name: "Highway 407", value: "15700,15701"},
        {name: "Vaughan Metropolitan Centre", value: "15662,15663"},
        {name: "VMC", value: "15662,15663"},
        {name: "NYC", value: "13790,13789"},
    ];

    createCommand(): object {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription("Get the next train arrival for an IRL TTC Station")
            .addStringOption((option: SlashCommandStringOption) => option.setName("station")
                .setDescription("The TTC Station to get the next train arrival for")
                .setRequired(true))
            .toJSON();
    }

    static async updateMessage(interaction: CommandInteraction, station: string, stationCode: string[], message: Message, count: number) {
        for (let deadMessage in this.deadMessages) {
            if (deadMessage === message.id) {
                this.activeMessages[deadMessage] = {interaction: interaction, station: station, stationCode: stationCode, message: message, count: count};
                delete this.deadMessages[deadMessage];
                break;
            }
        }
        let messageEmbed: EmbedBuilder = new EmbedBuilder();
        messageEmbed.setTitle("Next Train Arrival");
        messageEmbed.setDescription("The next train arrival for " + station.toUpperCase() + " is:");
        for (let code of stationCode) {
            let result = await axios.get("https://ntas.ttc.ca/api/ntas/get-next-train-time/" + code);
            if (result.status !== 200) {
                return interaction.reply({
                    content: "An error occurred. Please try again.",
                    ephemeral: true
                });
            }
            let data = result.data;
            let guild: Guild = await DiscordFetchHelpers.findGuild(client, process.env.EVENTS_GUILD);
            let lineEmote = {
                "1": await DiscordFetchHelpers.getGuildEmoji(client, guild, process.env.LINE1),
                "2": await DiscordFetchHelpers.getGuildEmoji(client, guild, process.env.LINE2),
                "3": await DiscordFetchHelpers.getGuildEmoji(client, guild, process.env.LINE3),
                "4": await DiscordFetchHelpers.getGuildEmoji(client, guild, process.env.LINE4),
            }
            let line: Emoji = lineEmote[data[0].line];
            let times: number[] = [];
            for (let time of data[0].nextTrains.split(", ")) {
                let value: number = parseInt(time);
                if (isNaN(value)) continue;
                times.push(value);
            }
            let timeText: string = "";
            for (let time of times) {
                if (time === 0) timeText += "Now, ";
                else if (time === 1) timeText += "1 minute, ";
                else timeText += time + " minutes, ";
            }
            if (timeText.endsWith(", ")) timeText = timeText.substring(0, timeText.length - 2);
            else timeText = "No trains found";
            messageEmbed.addFields({
                name: `${line} ${data[0].directionText}`,
                value: timeText
            });
            // if (count > 30) return;
            // setTimeout(this.updateMessage, 20000, interaction, station, stationCode, message, count + 1);
        }
        messageEmbed.setFooter({
            text: count >= 30 ? "Auto Updated disabled. Press the update button to continue." : "Auto updating every 20 seconds.",
        });
        await message.edit({embeds: [messageEmbed], content: null, components: [new ActionRowBuilder<ButtonBuilder>().addComponents(UpdateNTAS.discordButton())]});
    }

    static update() {
        for (let messageID in NTAS.activeMessages) {
            let garbage: Garbage = NTAS.activeMessages[messageID];
            if (garbage.count > 30) {
                // console.log("Ending support for ", garbage, t)
                NTAS.deadMessages[garbage.message.id] = {interaction: garbage.interaction, station: garbage.station, stationCode: garbage.stationCode, message: garbage.message, count: garbage.count};
                delete NTAS.activeMessages[messageID];
                continue;
            }
            NTAS.updateMessage(garbage.interaction, garbage.station, garbage.stationCode, garbage.message, garbage.count++).then();
        }
    }

    async execute(interaction: CommandInteraction, args) {
        let station: string = args["station"];
        station = station.toLowerCase();
        let stationCode: string[] = [];
        for (let code of this.stationCodes) {
            if (code.name.toLowerCase() === station) {
                stationCode = code.value.split(",");
                break;
            }
        }
        if (stationCode.length === 0) {
            return interaction.reply({
                content: "Station not found. Check your spelling and try again.",
                ephemeral: true
            });
        } else {
            let garbage: Garbage = {
                message: <Message>await interaction.reply({content: "Loading...", fetchReply: true}),
                interaction: interaction,
                station: station,
                stationCode: stationCode,
                count: -1
            }
            NTAS.activeMessages[garbage.message.id] = garbage;
            NTAS.updateMessage(interaction, station, stationCode, garbage.message, garbage.count++).then();
        }
    }
}