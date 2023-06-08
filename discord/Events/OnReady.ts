import {createCommands} from "../DiscordExtras";
import {client} from "../../backend";
import SQLSessionManager from "../../backend/SQL/SessionManager/SQLSessionManager";
import SQLRunManager from "../../backend/SQL/RunManager/SQLRunManager";
import SQLUserManager from "../../backend/SQL/UserManager/SQLUserManager";
import {DiscordFetchHelpers} from "../DiscordFetchHelper";
import {MessageActionRow, MessageButton} from "discord.js";
import {MessageButtonStyles} from "discord.js/typings/enums";
require("dotenv").config();

export default async function () {
    console.log("Logged in as " + client.user.tag);
    client.guilds.cache.forEach(await (async (guild) => {
        await createCommands(guild);
    }))

    setInterval(async () => {
        for (let session of (await SQLSessionManager.getSessions())) {
            let timeNow = new Date().getTime();
            let linkButton: MessageButton = new MessageButton({
                label: "Announcement",
                style: MessageButtonStyles.LINK,
                url: `https://discord.com/channels/${session.Guild}/${session.Channel}/${session.Message}`,
            });
            let actionRow: MessageActionRow = new MessageActionRow();
            actionRow.components.push(linkButton);
            if (session.Start_Time.getTime() - timeNow < 1800000 && session.HeadsUp <= 1) {
                session.HeadsUp = 2;
                await SQLSessionManager.setSession(session);
                let hostUser = await DiscordFetchHelpers.findUser(client, session.Host);
                hostUser.createDM().then(async (dm) => {
                    try {
                        await dm.send({
                            content: `Your run (${session.Name}) is ready to start! A reminder that the first train leaves at <t:${Math.floor(session.Start_Time.getTime() / 1000)}>\n` +
                                `Start the run via the website and then join <#429669071446081537> for the run.`,
                            components: [actionRow],
                        });
                    } catch (e) {
                        console.log(e);
                        console.log(`Failed to send DM to HOST (${hostUser.tag})`);
                    }
                });
                let runs = await SQLRunManager.getRunsFromArray(session.Runs);
                // Send a discord DM to each user
                for (let run of runs) {
                    if (!run.Driver) continue;
                    let driver = await SQLUserManager.getUser(run.Driver);
                    let user = await DiscordFetchHelpers.findUser(client, driver.Discord_ID);
                    if (!user) continue;
                    user.createDM().then(async (dm) => {
                        try {
                            await dm.send({
                                content: `Heads up! You have a run (${session.Name}) starting shortly! First train leaves <t:${Math.floor(session.Start_Time.getTime() / 1000)}:R>`,
                                components: [actionRow],
                            });
                        } catch (e) {
                            console.log(e);
                            console.log(`Failed to send DM to USER (${user.tag})`);
                        }
                    });
                }
                let controllers = session.Controllers
                for (let controller of controllers) {
                    let wUser = await SQLUserManager.getUser(controller.controller);
                    if (!wUser) continue;
                    if (wUser.Discord_ID === session.Host) continue;
                    let user = await DiscordFetchHelpers.findUser(client, wUser.Discord_ID);
                    if (!user) continue;
                    user.createDM().then(async (dm) => {
                        try {
                            await dm.send({
                                content: `Heads up! You are controlling zone \`${controller.zone}\` for (${session.Name})!
First train leaves <t:${Math.floor(session.Start_Time.getTime() / 1000)}:R>`,
                                components: [actionRow],
                            });
                        } catch (e) {
                            console.log(e);
                            console.log(`Failed to send DM to CONTROLLER (${user.tag})`);
                        }
                    });
                }
            }
            if (session.Start_Time.getTime() - timeNow < 3600000 && session.HeadsUp <= 0) {
                session.HeadsUp = 1;
                await SQLSessionManager.setSession(session);
                let hostUser = await DiscordFetchHelpers.findUser(client, session.Host);
                hostUser.createDM().then(async (dm) => {
                    await dm.send({
                        content: `Your run (${session.Name}) starts in about an hour! (<t:${Math.floor(session.Start_Time.getTime() / 1000)}>)\n` +
                            `You can start the run <t:${Math.floor(session.Start_Time.getTime() / 1000) - 1800}:R>`,
                        components: [actionRow],
                    });
                });
                let runs = await SQLRunManager.getRunsFromArray(session.Runs);
                // Send a discord DM to each user
                for (let run of runs) {
                    if (!run.Driver) continue;
                    let driver = await SQLUserManager.getUser(run.Driver);
                    let user = await DiscordFetchHelpers.findUser(client, driver.Discord_ID);
                    if (!user) continue;
                    user.createDM().then(async (dm) => {
                        try {
                            await dm.send({
                                content: `Heads up! You have a run (${session.Name}) starting in about an hour (<t:${Math.floor(session.Start_Time.getTime() / 1000)}>, <t:${Math.floor(session.Start_Time.getTime() / 1000)}:R>)!`,
                                components: [actionRow],
                            });
                        } catch (e) {
                            console.log(e);
                            console.log(`Failed to send DM to USER (${user.tag})`);
                        }
                    });
                }
                let controllers = session.Controllers
                for (let controller of controllers) {
                    let wUser = await SQLUserManager.getUser(controller.controller);
                    if (!wUser) continue;
                    if (wUser.Discord_ID === session.Host) continue;
                    let user = await DiscordFetchHelpers.findUser(client, wUser.Discord_ID);
                    if (!user) continue;
                    user.createDM().then(async (dm) => {
                        try {
                            await dm.send({
                                content: `Heads up! You are controlling zone \`${controller.zone}\` for (${session.Name}) in less than an hour!
First train leaves <t:${Math.floor(session.Start_Time.getTime() / 1000)}:R>`,
                                components: [actionRow],
                            });
                        } catch (e) {
                            console.log(e);
                            console.log(`Failed to send DM to CONTROLLER (${user.tag})`);
                        }
                    });
                }
            }
        }
    }, 60000);
}