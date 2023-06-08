import {SQLManager} from "./SQLManager";
import {Guild, GuildEmoji, Message, MessageActionRow, MessageButton, MessageEmbed, TextChannel} from "discord.js";
import {DiscordFetchHelpers} from "../../discord/DiscordFetchHelper";
import {client} from "../index";
import axios from "axios";
import {formatArray} from "../Extras";
import {MessageButtonStyles} from "discord.js/typings/enums";

export enum AlertType {
    CLEARED,
    DETOUR,
    DELAY,
    CONSTRUCTION,
    OTHER,
    CLOSURE,
    MINOR,
    MAJOR,
}

export const AlertTypeNames = [
    "Cleared",
    "Detour",
    "Delay",
    "Construction",
    "Other",
    "Closure",
    "Minor",
    "Major",
]
export interface AlertData {
    Alert_ID?: number;
    Type: AlertType;
    Type_Name?: string;
    Message: string;
    Started: Date | number | string;
    Expires: Date | number | string;
    Points: string;
    User: string;
    Discord_Message: string;
    Line: string;
}

export interface Point {
    record: number;
    time: Date | number | string;
    alertType: AlertType;
    message: string;
    user: string;
}

export default class Alerts {
    Alert_ID: number;
    Type: AlertType;
    Type_Name: string;
    Message: string;
    Started: Date;
    Expires: Date;
    Points: Point[];
    User: string;
    Discord_Message: string;
    Line: string;

    constructor(DB_Alert: AlertData) {
        this.Alert_ID = DB_Alert.Alert_ID;
        this.Type = DB_Alert.Type;
        this.Type_Name = DB_Alert.Type_Name;
        this.Message = DB_Alert.Message;
        this.Started = new Date(DB_Alert.Started);
        this.Expires = new Date(DB_Alert.Expires);
        this.Points = JSON.parse(DB_Alert.Points);
        this.User = DB_Alert.User;
        this.Discord_Message = DB_Alert.Discord_Message;
        this.Line = DB_Alert.Line;
    }

    static async new(type: AlertType, message: string, starts: Date, expires: Date | null, user: string, firstPoint: string, line: string, typeName?: string) {
        let alert = new Alerts({
            Alert_ID: await this.getValidID(),
            Type: type,
            Type_Name: typeName ? typeName : AlertTypeNames[type],
            Message: message,
            Started: starts,
            Expires: expires ? expires : new Date(Date.now() + 10 * 60 * 1000),
            Points: JSON.stringify([{
                record: 0,
                time: new Date(),
                alertType: type,
                message: firstPoint,
                user: user,
            }]),
            User: user,
            Discord_Message: null,
            Line: line,
        });
        if (type === AlertType.MAJOR || type === AlertType.MINOR) {
            let guild = await DiscordFetchHelpers.findGuild(client, process.env.EVENTS_GUILD);
            let channel = <TextChannel>await DiscordFetchHelpers.findChannel(client, guild, process.env.EVENTS_CHANNEL);
            let message = await channel.send(`${alert.Type_Name} Event occurring on Line ${alert.Line}:`);
            alert.Discord_Message = message.id;
        }
        await alert.save();
        AlertHandler.update().then();
        return alert;
    }

    async getDiscordMessage(): Promise<Message> {
        if (!this.Discord_Message) return null;
        let guild = await DiscordFetchHelpers.findGuild(client, process.env.EVENTS_GUILD);
        let channel = <TextChannel>await DiscordFetchHelpers.findChannel(client, guild, process.env.EVENTS_CHANNEL);
        return await DiscordFetchHelpers.findMessage(client, channel, this.Discord_Message);
    }

    async newPoint(message: string, user: string, type?: AlertType) {
        let points = this.Points;
        let newType = type;
        if (newType === null || isNaN(newType)) {
            if (points.length === 0) newType = this.Type;
            else newType = points[points.length - 1].alertType;
        }
        let point: Point = {
            record: points.length,
            time: new Date(),
            alertType: newType,
            message: message,
            user: user,
        };
        if (newType === AlertType.MAJOR) this.Type = AlertType.MAJOR;
        points.push(point);
        this.Points = points;
        console.log(newType, type, this.Type, newType === AlertType.CLEARED);
        if (newType === AlertType.CLEARED) this.Expires = new Date();
        // Set expiration to 10 minutes from now
        else this.Expires = new Date(new Date().getTime() + 15 * 60 * 1000);
        await this.save();
        AlertHandler.update().then();
    }

    async save() {
        await SQLManager.addToQueue(`INSERT OR REPLACE INTO Alerts (Alert_ID, Type, Type_Name, Message, Started, Expires, Points, User, Discord_Message, Line)
                      VALUES (${formatArray(this.toArray())})`, true);
    }

    static async save(alert: Alerts | Alerts[]) {
        if (Array.isArray(alert)) for (let a of alert) await a.save();
        else await alert.save();
    }

    async delete() {
        await SQLManager.addToQueue(`DELETE FROM Alerts WHERE Alert_ID = ${this.Alert_ID}`, true);
    }

    static async delete(alert: Alerts | Alerts[]) {
        if (Array.isArray(alert)) for (let a of alert) await a.delete();
        else await alert.delete();
    }

    static async getAll(): Promise<Alerts[]> {
        let list = await SQLManager.addToQueue(`SELECT * FROM Alerts`, false);
        return list.map(a => new Alerts(a));
    }

    static async get(alertID: number): Promise<Alerts> {
        let result = await SQLManager.addToQueue(`SELECT * FROM Alerts WHERE Alert_ID = ${alertID}`, true);
        if (!result) return null;
        return new Alerts(result);
    }

    private static async getValidID(): Promise<number> {
        let id = 0;
        let alerts = await this.getAll();
        while (alerts.filter(a => a.Alert_ID === id).length > 0) id++;
        return id;
    }

    toArray() {
        return [this.Alert_ID, this.Type, this.Type_Name, this.Message, this.Started.toString(), this.Expires ? this.Expires.toString() : null, JSON.stringify(this.Points), this.User, this.Discord_Message, this.Line];
    }
}
interface LiveAlertData {
    id: string;
    priority: number;
    alertType: string;
    lastUpdated: string;
    activePeriod: {start: string, end: string};
    activePeriodGroup: string[];
    routeOrder: number;
    route: string;
    routeBranch: string;
    routeTypeSrc: string;
    routeType: string;
    title: string;
    description: string;
    url: string;
    urlPlaceholder: string;
    accessibility: string;
    effect: string;
    effectDesc: string;
    severityOrder: number;
    severity: string;
    customHeaderText: string;
    headerText: string;
}

interface LiveAlertsData {
    total: number;
    lastUpdated: string;
    routes: LiveAlertData[];
    accessibility: LiveAlertData[];
    siteWide: LiveAlertData[] | null;
    siteWideCustom: LiveAlertData[] | null;
    generalCustom: LiveAlertData[] | null;
}

export class AlertHandler {
    private static initialized: boolean = false;
    private static guild: Guild;
    private static channel: TextChannel;
    private static message: Message;
    private static extraMessages: { isFor: AlertType, message: Message }[] = [];

    private static greenL: GuildEmoji;
    private static yellowL: GuildEmoji;
    private static redL: GuildEmoji;
    private static greenLF: GuildEmoji;
    private static yellowLF: GuildEmoji;
    private static redLF: GuildEmoji;
    private static greenLFO: GuildEmoji;
    private static yellowLFO: GuildEmoji;
    private static redLFO: GuildEmoji;

    private static lineEmotes: {[key: string]: GuildEmoji} = {};

    static getMessage(): Message {
        return this.message;
    }

    static async init() {
        // if (this.initialized) return;
        this.guild = await DiscordFetchHelpers.findGuild(client, process.env.EVENTS_GUILD);
        this.channel = <TextChannel>await DiscordFetchHelpers.findChannel(client, this.guild, process.env.EVENTS_CHANNEL);
        let embed: MessageEmbed = new MessageEmbed();
        embed.setTitle("Alerts");
        embed.setDescription("TTC Alerts initializing...");
        embed.setColor("RED");
        embed.footer = {text: "Bot is getting things ready..."};
        this.message = await this.channel.send({embeds: [embed]});

        this.greenL = await DiscordFetchHelpers.getGuildEmoji(client, this.guild, process.env.GREEN);
        this.yellowL = await DiscordFetchHelpers.getGuildEmoji(client, this.guild, process.env.YELLOW);
        this.redL = await DiscordFetchHelpers.getGuildEmoji(client, this.guild, process.env.RED);
        this.greenLF = await DiscordFetchHelpers.getGuildEmoji(client, this.guild, process.env.GREENF);
        this.yellowLF = await DiscordFetchHelpers.getGuildEmoji(client, this.guild, process.env.YELLOWF);
        this.redLF = await DiscordFetchHelpers.getGuildEmoji(client, this.guild,  process.env.REDF);
        this.greenLFO = await DiscordFetchHelpers.getGuildEmoji(client, this.guild, process.env.GREENFO);
        this.yellowLFO = await DiscordFetchHelpers.getGuildEmoji(client, this.guild, process.env.YELLOWFO);
        this.redLFO = await DiscordFetchHelpers.getGuildEmoji(client, this.guild, process.env.REDFO);

        this.lineEmotes = {
            "1": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, process.env.LINE1),
            "2": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, process.env.LINE2),
            "3": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, process.env.LINE3),
            "4": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, process.env.LINE4),
            // "301": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, "1069703505822097488"),
            // "304": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, "1069703439715676351"),
            // "306": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, "1069703436477665481"),
            // "310": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, "1069703505822097488"),
            // "501": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, "1069703439715676351"),
            // "504": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, "1069703436477665481"),
            // "505": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, "1069703505822097488"),
            // "506": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, "1069703439715676351"),
            // "509": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, "1069703436477665481"),
            // "510": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, "1069703505822097488"),
            // "511": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, "1069703439715676351"),
            // "512": await DiscordFetchHelpers.getGuildEmoji(client, this.guild, "1069703436477665481"),
        }

        this.initialized = true;

        console.log(this.extraMessages);
        for (let msg of this.extraMessages) {
            if (!msg.message) continue;
            await msg.message.delete();
            let messageEmbed: MessageEmbed = new MessageEmbed();
            messageEmbed.setTitle("Placeholder");
            messageEmbed.setDescription("The bot is currently reposting all alerts");
            messageEmbed.setColor([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);
            msg.message = await this.channel.send({embeds: [messageEmbed]});
        }

        let allAlerts: Alerts[] = await Alerts.getAll();
        for (let alert of allAlerts) {
            if (!alert.Discord_Message) continue;
            let dedicatedMessage: Message = await DiscordFetchHelpers.findMessage(client, this.channel, alert.Discord_Message);
            if (!dedicatedMessage) continue;
            let messageContent: string = dedicatedMessage.content;
            let newMessage = await this.channel.send(messageContent);
            await dedicatedMessage.delete();
            alert.Discord_Message = newMessage.id;
            await alert.save();
        }
        this.update().then();
    }

    private static getEmojis(type: AlertType) {
        let typeEmote: GuildEmoji;
        let typeOffEmote: GuildEmoji;
        switch (type) {
            case AlertType.CLOSURE:
            case AlertType.MAJOR:
                typeEmote = this.redLF;
                typeOffEmote = this.redLFO;
                break;
            case AlertType.DELAY:
            case AlertType.MINOR:
            case AlertType.DETOUR:
                typeEmote = this.yellowLF;
                typeOffEmote = this.yellowLFO;
                break;
            default:
                typeEmote = this.greenLF;
                typeOffEmote = this.greenLFO;
        }
        return [typeEmote, typeOffEmote];
    }

    private static determineType(effect: string, accessibility?: string) {
        if (!effect) return AlertType.OTHER;
        if (effect.toLowerCase().includes("delay")) return AlertType.DELAY;
        if (effect.toLowerCase().includes("detour")) return AlertType.DETOUR;
        if (effect.toLowerCase().includes("no_service")) {
            if (accessibility.toLowerCase().includes("elevator")) return AlertType.OTHER;
            return AlertType.CLOSURE;
        }
        if (effect.toLowerCase().includes("resume")) return AlertType.CLEARED;
        return AlertType.OTHER;
    }

    private static determineExpire(start: Date, end: Date) {
        if (end.getTime() - new Date().getTime() > 30 * 60 * 1000) {
            end = new Date(new Date().getTime() + 30 * 60 * 1000);
        }
        if (start > end) return null;
        return end;
    }

    static async getAlerts() {
        // Make a GET request to https://alerts.ttc.ca/api/alerts/live-alerts with axios
        let response = await axios.get("https://alerts.ttc.ca/api/alerts/list");
        let alerts: LiveAlertsData = response.data;
        let routeAlerts: LiveAlertData[] = alerts.routes;
        let accessibilityAlerts: LiveAlertData[] = alerts.accessibility;
        let generalAlerts: LiveAlertData[] = alerts.generalCustom || alerts.siteWide || alerts.siteWideCustom || [];

        let allAlerts: LiveAlertData[] = routeAlerts.concat(accessibilityAlerts).concat(generalAlerts);

        for (let alert of allAlerts) {
            // Try to match with an existing alert
            let existing = await Alerts.get(parseInt(alert.id));
            // console.log(alert, existing)
            if (!existing) {
                // console.log(alert)
                existing = new Alerts({
                    Alert_ID: parseInt(alert.id),
                    Discord_Message: null,
                    Expires: this.determineExpire(new Date(alert.activePeriod.start), new Date(alert.activePeriod.end)),
                    Message: alert.title === "WEBSITE" ? alert.description : alert.accessibility === "Elevator" ? alert.headerText :  alert.title,
                    Points: "[]",
                    Started: new Date(alert.activePeriod.start),
                    Type: this.determineType(alert.effect, alert.accessibility),
                    Type_Name: alert.effectDesc,
                    User: "AUTO",
                    Line: alert.route ? alert.route : null,
                });
                await existing.save()
            }else {
                existing.Expires = this.determineExpire(new Date(alert.activePeriod.start), new Date(alert.activePeriod.end));
                existing.Type = this.determineType(alert.effect, alert.accessibility);
                existing.Type_Name = alert.effectDesc;
                existing.Message = alert.title === "WEBSITE" ? alert.description : alert.accessibility === "Elevator" ? alert.headerText :  alert.title;
                await existing.save();
            }
        }
    }

    static async expire() {
        let alerts = await Alerts.getAll();
        // Get all alerts that are 10 minutes past their expiration
        let expired = alerts.filter(a => {
            if (!a.Expires) return false;
            // console.log(a, a.Expires < new Date(Date.now() - 10 * 60 * 1000))
            return a.Expires < new Date(new Date().getTime() - 5 * 60 * 1000);
        });
        let expiredMajors = expired.filter(a => a.Type === AlertType.MAJOR || a.Type === AlertType.MINOR);
        for (let major of expiredMajors) {
            let message = await DiscordFetchHelpers.findMessage(client, this.channel, major.Discord_Message).catch(e => console.error(e));
            if (message) {
                await message.delete();
            }
        }
        // console.log(expired)
        await Alerts.delete(expired);
        alerts = await Alerts.getAll();
        let stales = alerts.filter(a => {
            if (!a.Expires) return false;
            return a.Expires < new Date()
        });
        for (let stale of stales) {
            if (stale.Points.length > 0 && stale.Points[stale.Points.length - 1].alertType === AlertType.CLEARED) continue;
            await stale.newPoint("Assumed Clear (Inactive for 15 minutes)", "Auto", AlertType.CLEARED);
        }
    }

    private static replaceBadString(str: string) {
        // Remove any text that is in <> brackets
        if (!str) return "";
        return str.replace(/<[^>]*>/g, "");
    }

    private static countEmbeds(...embeds: MessageEmbed[]) {
        let counter = 0;
        for (let embed of embeds) {
            counter += embed.length;
        }
        return counter;
    }

    private static checkForMyMessage(type: AlertType) {
        return this.extraMessages.find(m => m.isFor === type)
    }

    static async update() {
        await this.expire();
        await this.getAlerts();
        let alerts = await Alerts.getAll();
        let embed: MessageEmbed = new MessageEmbed();
        let extraEmbeds: MessageEmbed[] = [];
        embed.setTitle("Active TTC Alerts");
        embed.setDescription("Actively watching for TTC Alerts. \n" +
            "You can help contribute by using commands to add something.\n" +
            "Misuse or swearing in any of the messages may result in a timeout and or removal of permissions.");
        // Find an event type that has a closure
        let closures = alerts.filter(a => a.Type === AlertType.CLOSURE);
        let msg = this.checkForMyMessage(AlertType.CLOSURE);
        let content = "";
        if (!msg) {
            for (let c of closures) {
                let line: string = this.lineEmotes[c.Line] ? this.lineEmotes[c.Line].toString() : c.Line;
                content += `${this.redL} Line ${line}: ${this.replaceBadString(c.Message)} ${this.redL} (${c.User})\n`
            }
            if (content === "") content = "No closures at this time.";
        }
        if (content.length > 1000 || msg) {
            let extraEmbed: MessageEmbed = new MessageEmbed();
            extraEmbed.setTitle("⛔ Closures ⛔");
            extraEmbed.setDescription("Too Many Closures to fit in one embed.");
            for (let c of closures) {
                let line: string = this.lineEmotes[c.Line] ? this.lineEmotes[c.Line].toString() : c.Line;
                extraEmbed.addField(`Line ${line}`, `${this.replaceBadString(c.Message)} (${c.User})`, true);
            }
            if (closures.length === 0) {
                content = "No closures at this time.";
                await msg.message.delete();
                this.extraMessages = this.extraMessages.filter(m => m.isFor !== AlertType.CLOSURE);
            }
            else
                content = "See extra embed below for closures.";
            extraEmbed.setColor([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);
            if (msg)
                await msg.message.edit({embeds: [extraEmbed]})
            else
                extraEmbeds.push(extraEmbed);
        }
        embed.addField("⛔ Closures ⛔", content, content === "No closures at this time." || content === "See extra embed below for closures.");
        if (this.countEmbeds(embed, ...extraEmbeds) + content.length > 5500) {
            let newMsg = await this.channel.send("TOO MANY ALERTS TO FIT IN ONE MESSAGE. REPOSTING TO KEEP THINGS ORGANIZED");
            this.extraMessages.push({message: newMsg, isFor: AlertType.CLOSURE});
            console.error("REPOSTING TO KEEP THINGS ORGANIZED");
            return this.init();
        }
        // Find an event type that has a delay
        let delays = alerts.filter(a => a.Type === AlertType.DELAY);
        content = "";
        msg = this.checkForMyMessage(AlertType.DELAY);
        if (!msg) {
            for (let d of delays) {
                let line: string = this.lineEmotes[d.Line] ? this.lineEmotes[d.Line].toString() : d.Line;
                content += `${this.yellowL} Line ${line}: ${this.replaceBadString(d.Message)} ${this.yellowL} (${d.User})\n`
            }
            if (content === "") content = "No delays at this time.";
        }
        if (content.length > 1000 || msg) {
            let extraEmbed: MessageEmbed = new MessageEmbed();
            extraEmbed.setTitle("⏳ Delays ⏳");
            extraEmbed.setDescription("Too Many Delays to fit in one embed.");
            for (let d of delays) {
                let line: string = this.lineEmotes[d.Line] ? this.lineEmotes[d.Line].toString() : d.Line;
                extraEmbed.addField(`${this.yellowL} Line ${line}: ${this.yellowL} (${d.User})`, ` ${this.replaceBadString(d.Message)}`)
            }
            if (delays.length === 0) {
                content = "No delays at this time.";
                await msg.message.delete();
                this.extraMessages = this.extraMessages.filter(m => m.isFor !== AlertType.DELAY);
                msg = null;
            }
            else
                content = "See extra embed for delays."
            extraEmbed.setColor([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);
            if (msg)
                await msg.message.edit({embeds: [extraEmbed]})
            else
                extraEmbeds.push(extraEmbed);
        }
        embed.addField("⏳ Delays ⏳", content, content === "No delays at this time." || content === "See extra embed for delays.");
        if (this.countEmbeds(embed, ...extraEmbeds) + content.length > 5500) {
            let newMsg = await this.channel.send("TOO MANY ALERTS TO FIT IN ONE MESSAGE. REPOSTING TO KEEP THINGS ORGANIZED");
            this.extraMessages.push({message: newMsg, isFor: AlertType.DELAY});
            console.error("REPOSTING TO KEEP THINGS ORGANIZED");
            return this.init();
        }
        // Find an event type that has a detour
        let detours = alerts.filter(a => a.Type === AlertType.DETOUR);
        content = "";
        msg = this.checkForMyMessage(AlertType.DETOUR);
        if (!msg) {
            for (let d of detours) {
                let line: string = this.lineEmotes[d.Line] ? this.lineEmotes[d.Line].toString() : d.Line;
                content += `${this.yellowL} Line ${line}: ${this.replaceBadString(d.Message)} ${this.yellowL} (${d.User})\n`
            }
            if (content === "") content = "No detours at this time.";
        }
        if (content.length > 1000 || msg) {
            let extraEmbed: MessageEmbed = new MessageEmbed();
            extraEmbed.setTitle("🚦 Detours 🚦");
            extraEmbed.setDescription("Too Many Detours to fit in one embed.");
            for (let d of detours) {
                let line: string = this.lineEmotes[d.Line] ? this.lineEmotes[d.Line].toString() : d.Line;
                extraEmbed.addField(`${this.yellowL} Line ${line}: ${this.yellowL} (${d.User})`, ` ${this.replaceBadString(d.Message)}`)
            }
            if (detours.length === 0) {
                content = "No detours at this time.";
                await msg.message.delete();
                this.extraMessages = this.extraMessages.filter(m => m.isFor !== AlertType.DETOUR);
                msg = null;
            }
            else
                content = "See extra embed for detours."
            extraEmbed.setColor([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);
            if (msg)
                await msg.message.edit({embeds: [extraEmbed]})
            else
                extraEmbeds.push(extraEmbed);
        }
        embed.addField("🚦 Detours 🚦", content, content === "No detours at this time." || content === "See extra embed for detours.");
        if (this.countEmbeds(embed, ...extraEmbeds) + content.length > 5500) {
            let newMsg = await this.channel.send("TOO MANY ALERTS TO FIT IN ONE MESSAGE. REPOSTING TO KEEP THINGS ORGANIZED");
            this.extraMessages.push({message: newMsg, isFor: AlertType.DETOUR});
            console.error("REPOSTING TO KEEP THINGS ORGANIZED");
            return this.init();
        }
        // Find any event with type of other
        let others = alerts.filter(a => a.Type === AlertType.OTHER);
        content = "";
        msg = this.checkForMyMessage(AlertType.OTHER);
        if (!msg) {
            for (let o of others) {
                let line: string = this.lineEmotes[o.Line] ? this.lineEmotes[o.Line].toString() : o.Line;
                content += `${this.greenL}${line ? " Line " + line + ":" : ""} ${this.replaceBadString(o.Message)} ${this.greenL} (${o.User})\n`
            }
            if (content === "") content = "No other alerts at this time.";
        }
        if (content.length > 1000 || msg) {
            let extraEmbed: MessageEmbed = new MessageEmbed();
            extraEmbed.setTitle("❓ Other ❓");
            extraEmbed.setDescription("Too Many Other Alerts to fit in one embed.");
            for (let o of others) {
                let line: string = this.lineEmotes[o.Line] ? this.lineEmotes[o.Line].toString() : o.Line;
                extraEmbed.addField(`${this.greenL}${line ? " Line " + line + ":" : ""} ${this.greenL} (${o.User})`, ` ${this.replaceBadString(o.Message)}`)
            }
            if (others.length === 0) {
                content = "No other alerts at this time.";
                await msg.message.delete();
                this.extraMessages = this.extraMessages.filter(m => m.isFor !== AlertType.OTHER);
                msg = null;
            }
            else
                content = "See extra embed for other alerts."
            extraEmbed.setColor([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);
            if (msg)
                await msg.message.edit({embeds: [extraEmbed]})
            else
                extraEmbeds.push(extraEmbed);
        }
        embed.addField("❓ Other ❓", content, content === "No other alerts at this time." || content === "See extra embed for other alerts.");
        if (this.countEmbeds(embed, ...extraEmbeds) + content.length > 5500) {
            let newMsg = await this.channel.send("TOO MANY ALERTS TO FIT IN ONE MESSAGE. REPOSTING TO KEEP THINGS ORGANIZED");
            this.extraMessages.push({message: newMsg, isFor: AlertType.OTHER});
            console.error("REPOSTING TO KEEP THINGS ORGANIZED");
            return this.init();
        }
        // Find any events with type Construction but name is Slow Zones
        let slowZones = alerts.filter(a => a.Type === AlertType.CONSTRUCTION);
        content = "";
        msg = this.checkForMyMessage(AlertType.CONSTRUCTION);
        if (!msg) {
            for (let s of slowZones) {
                let line: string = this.lineEmotes[s.Line] ? this.lineEmotes[s.Line].toString() : s.Line;
                content += `${this.yellowL} Line ${line}: ${this.replaceBadString(s.Message)} ${this.yellowL} (${s.User})\n` +
                    `**Started: <t:${Math.floor(s.Started.getTime() / 1000)}:R>**\n` +
                    `**Expires: <t:${Math.floor(s.Expires.getTime() / 1000)}:R>**\n` +
                    `ID: ${s.Alert_ID}`;
            }
            if (content === "") content = "No slow zones reported at this time.";
        }
        if (content.length > 1000 || msg) {
            let extraEmbed: MessageEmbed = new MessageEmbed();
            extraEmbed.setTitle("🦺 Slow Zones 🦺");
            extraEmbed.setDescription("Too Many Slow Zones to fit in one embed.");
            for (let s of slowZones) {
                let line: string = this.lineEmotes[s.Line] ? this.lineEmotes[s.Line].toString() : s.Line;
                extraEmbed.addField(`${this.yellowL} Line ${line}: ${this.replaceBadString(s.Message)} ${this.yellowL}`,
                    `Reported by ${s.User}\n` +
                    `**Started: <t:${Math.floor(s.Started.getTime() / 1000)}:R>**\n` +
                    `**Expires: <t:${Math.floor(s.Expires.getTime() / 1000)}:R>**\n`)
            }
            if (slowZones.length === 0) {
                content = "No slow zones reported at this time.";
                await msg.message.delete();
                this.extraMessages = this.extraMessages.filter(m => m.isFor !== AlertType.CONSTRUCTION);
                msg = null;
            }
            else
                content = "See extra embed for slow zones."
            extraEmbed.setColor([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);
            if (msg)
                await msg.message.edit({embeds: [extraEmbed]})
            else
                extraEmbeds.push(extraEmbed);
        }
        embed.addField("🦺 Slow Zones 🦺", content, content === "No slow zones reported at this time." || content === "See extra embed for slow zones.");
        if (this.countEmbeds(embed, ...extraEmbeds) + content.length > 5500) {
            let newMsg = await this.channel.send("TOO MANY ALERTS TO FIT IN ONE MESSAGE. REPOSTING TO KEEP THINGS ORGANIZED");
            this.extraMessages.push({message: newMsg, isFor: AlertType.CONSTRUCTION});
            console.error("REPOSTING TO KEEP THINGS ORGANIZED");
            return this.init();
        }
        // Find any event with type Minor
        let minors = alerts.filter(a => a.Type === AlertType.MINOR);
        content = "";
        msg = this.checkForMyMessage(AlertType.MINOR);
        for (let m of minors) {
            let line: string = this.lineEmotes[m.Line] ? this.lineEmotes[m.Line].toString() : m.Line;
            // console.log(m);
            let dedicatedMessage: Message = await DiscordFetchHelpers.findMessage(client, this.channel, m.Discord_Message);
            // console.log(dedicatedMessage);
            let status = m.Points.length > 0 ? m.Points[m.Points.length - 1].alertType : AlertType.MINOR;
            let emotes = this.getEmojis(status);
            if (!msg)
                content += `**${emotes[0]} ${this.replaceBadString(m.Message)} ${emotes[1]} (${m.User})**\n` +
                    `**Line ${line}**\n` +
                    `**Started: <t:${Math.floor(new Date(m.Started).getTime() / 1000)}:R>**\n` +
                    `**Expires: ${m.Expires ? '<t:' + Math.floor(new Date(m.Expires).getTime() / 1000) + ':R>' : 'Until Further Notice'}**\n` +
                    `Message: ${dedicatedMessage.url}\n`;
            let eb = new MessageEmbed();
            eb.setTitle(`${emotes[0]} ${m.Message} ${emotes[1]}`);
            eb.setDescription(`**Started: <t:${Math.floor(new Date(m.Started).getTime() / 1000)}:R>**\n` +
                `**Expires: ${m.Expires ? '<t:' + Math.floor(new Date(m.Expires).getTime() / 1000) + ':R>' : 'Until Further Notice'}**\n` +
                `**Line ${line}**\n***ID: ${m.Alert_ID}***`);
            eb.setColor([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);
            for (let p of m.Points) {
                let emotes = this.getEmojis(p.alertType);
                let typeEmote = emotes[0];
                let typeOffEmote = emotes[1];
                eb.addField(`${typeEmote} ${p.message} ${typeOffEmote}`,
                    `Reported by ${p.user} <t:${Math.floor(new Date(p.time).getTime() / 1000)}:R>`, false);
            }
            await dedicatedMessage.edit({embeds: [eb]});
        }
        if (content === "") content = "No minor alerts at this time.";
        if (content.length > 1000 || msg) {
            let messageEmbed: MessageEmbed = new MessageEmbed();
            messageEmbed.setTitle("⚠️ Minor Alerts ⚠️");
            messageEmbed.setDescription("Too Many Minor Alerts to fit in one embed.");
            for (let m of minors) {
                let line: string = this.lineEmotes[m.Line] ? this.lineEmotes[m.Line].toString() : m.Line;
                let dedicatedMessage: Message = await DiscordFetchHelpers.findMessage(client, this.channel, m.Discord_Message);
                let status = m.Points.length > 0 ? m.Points[m.Points.length - 1].alertType : AlertType.MINOR;
                let emotes = this.getEmojis(status);
                messageEmbed.addField(`**${emotes[0]} ${this.replaceBadString(m.Message)} ${emotes[1]}**`,
                    `Reported by ${m.User}\n` +
                    `**Line ${line}**\n` +
                    `**Started: <t:${Math.floor(new Date(m.Started).getTime() / 1000)}:R>**\n` +
                    `**Expires: ${m.Expires ? '<t:' + Math.floor(new Date(m.Expires).getTime() / 1000) + ':R>' : 'Until Further Notice'}**\n` +
                    `Message: ${dedicatedMessage.url}\n`);
            }
            if (minors.length === 0) {
                content = "No minor alerts at this time.";
                await msg.message.delete();
                this.extraMessages = this.extraMessages.filter(m => m.isFor !== AlertType.MINOR);
                msg = null;
            }
            else
                content = "See extra embed for minor alerts."
            messageEmbed.setColor([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);
            if (msg)
                await msg.message.edit({embeds: [messageEmbed]})
            else
                extraEmbeds.push(messageEmbed);
        }
        embed.addField("⚠️ Minor Alerts ⚠️", content, content === "No minor alerts at this time." || content === "See extra embed for minor alerts.");
        if (this.countEmbeds(embed, ...extraEmbeds) + content.length > 5500) {
            let newMsg = await this.channel.send("TOO MANY ALERTS TO FIT IN ONE MESSAGE. REPOSTING TO KEEP THINGS ORGANIZED");
            this.extraMessages.push({message: newMsg, isFor: AlertType.MINOR});
            console.error("REPOSTING TO KEEP THINGS ORGANIZED");
            return this.init();
        }
        // Find any event with type Major. And handle these with an individual message embed.
        let majors = alerts.filter(a => a.Type === AlertType.MAJOR);
        content = "";
        msg = this.checkForMyMessage(AlertType.MAJOR);
        for (let m of majors) {
            let line: string = this.lineEmotes[m.Line] ? this.lineEmotes[m.Line].toString() : m.Line;
            let dedicatedMessage: Message = await DiscordFetchHelpers.findMessage(client, this.channel, m.Discord_Message);
            let status = m.Points.length > 0 ? m.Points[m.Points.length - 1].alertType : m.Type;
            let emotes = this.getEmojis(status);
            if (!msg)
                content += `**${emotes[0]} ${this.replaceBadString(m.Message)} ${emotes[1]} (${m.User})**\n` +
                    `**Line ${line}**\n` +
                    `**Started: <t:${Math.floor(new Date(m.Started).getTime() / 1000)}:R>**\n` +
                    `**Expires: ${m.Expires ? '<t:' + Math.floor(new Date(m.Expires).getTime() / 1000) + ':R>' : 'Until Further Notice'}**\n` +
                    `Message: ${dedicatedMessage.url}\n`;
            let eb = new MessageEmbed();
            eb.setTitle(`${emotes[0]} ${m.Message} ${emotes[1]}`);
            eb.setDescription(`**Started: <t:${Math.floor(new Date(m.Started).getTime() / 1000)}:R>**\n` +
                `**Expires: ${m.Expires ? '<t:' + Math.floor(new Date(m.Expires).getTime() / 1000) + ':R>' : 'Until Further Notice'}**\n` +
                `**Line ${line}**\n***ID: ${m.Alert_ID}***`);
            eb.setColor([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);
            for (let p of m.Points) {
                let emotes = this.getEmojis(p.alertType);
                let typeEmote = emotes[0];
                let typeOffEmote = emotes[1];
                eb.addField(`${typeEmote} ${p.message} ${typeOffEmote}`,
                    `Reported by ${p.user} <t:${Math.floor(new Date(p.time).getTime() / 1000)}:R>`, false);
            }
            await dedicatedMessage.edit({embeds: [eb]});
        }
        if (content === "") content = "No major alerts at this time.";
        if (content.length > 1000 || msg) {
            let messageEmbed: MessageEmbed = new MessageEmbed();
            messageEmbed.setTitle("🚨 Major Alerts 🚨");
            messageEmbed.setDescription("Too Many Major Alerts to fit in one embed.");
            for (let m of majors) {
                let line: string = this.lineEmotes[m.Line] ? this.lineEmotes[m.Line].toString() : m.Line;
                let dedicatedMessage: Message = await DiscordFetchHelpers.findMessage(client, this.channel, m.Discord_Message);
                let status = m.Points.length > 0 ? m.Points[m.Points.length - 1].alertType : m.Type;
                let emotes = this.getEmojis(status);
                messageEmbed.addField(`**${emotes[0]} ${this.replaceBadString(m.Message)} ${emotes[1]}**`,
                    `Reported by ${m.User}\n` +
                    `**Line ${line}**\n` +
                    `**Started: <t:${Math.floor(new Date(m.Started).getTime() / 1000)}:R>**\n` +
                    `**Expires: ${m.Expires ? '<t:' + Math.floor(new Date(m.Expires).getTime() / 1000) + ':R>' : 'Until Further Notice'}**\n` +
                    `Message: ${dedicatedMessage.url}\n`);
            }
            if (majors.length === 0) {
                content = "No major alerts at this time.";
                await msg.message.delete();
                this.extraMessages = this.extraMessages.filter(m => m.isFor !== AlertType.MAJOR);
                msg = null;
            }
            else
                content = "See extra embed for major alerts."
            messageEmbed.setColor([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);
            if (msg)
                await msg.message.edit({embeds: [messageEmbed]})
            else
                extraEmbeds.push(messageEmbed);
        }
        embed.addField("🚨 Major Alerts 🚨", content, content === "No major alerts at this time." || content === "See extra embed for major alerts.");
        if (this.countEmbeds(embed, ...extraEmbeds) + content.length > 5500) {
            let newMsg = await this.channel.send("TOO MANY ALERTS TO FIT IN ONE MESSAGE. REPOSTING TO KEEP THINGS ORGANIZED");
            this.extraMessages.push({message: newMsg, isFor: AlertType.MAJOR});
            console.error("REPOSTING TO KEEP THINGS ORGANIZED");
            return this.init();
        }
        embed.footer = {text: "Last Updated: "};
        embed.timestamp = Date.now();
        // Pick a random colour for the embed
        embed.setColor([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);
        // console.log(embed, embed.fields);
        let embeds = [embed];
        extraEmbeds.forEach(e => embeds.push(e));
        console.log("Embed counter: " + this.countEmbeds(embed, ...extraEmbeds));
        await this.message.edit({embeds: embeds});
    }

}