import {VoiceState} from "discord.js";
import SQLSessionManager from "../../backend/SQL/SessionManager/SQLSessionManager";
import SQLRunManager from "../../backend/SQL/RunManager/SQLRunManager";
import User from "../../backend/SQL/UserManager/User";
import SQLUserManager from "../../backend/SQL/UserManager/SQLUserManager";
import GameEvent from "../../backend/SQL/EventManager/GameEvent";
import UnMuteManager from "../../backend/SQL/UnmuteList/UnMuteManager";
require("dotenv").config();

export default async function (oldState: VoiceState, newState: VoiceState) {
    // if (oldState.channelID !== newState.channelID) {
    //     if (oldState.channelID) {
    //         oldState.channel.leave();
    //     }
    //     if (newState.channelID) {
    //         newState.channel.join();
    //     }
    // }
    // console.log("VCJoin", oldState, newState);
    if (oldState.channelId === newState.channelId) return;
    try {
        if (oldState.channelId === process.env.COMMS_CHANNEL_ID && newState.channelId != process.env.COMMS_CHANNEL_ID) {
            console.log(`Un-Server muting ${newState.member.displayName}`);
            if (newState.channelId === null && oldState.serverMute) {
                console.log(`${newState.member.displayName} is not in a channel`);
                if (!await UnMuteManager.hasUser(newState.member.id))
                    await UnMuteManager.addUser(newState.member.id);
                console.log(`${newState.member.displayName} has been added to the unmute list`);
                return;
            }else if (newState.serverMute) {
                await newState.member.voice.setMute(false, "Left the VC"); // Unmute
            }
        } else if (newState.channelId === process.env.COMMS_CHANNEL_ID) { //429669071446081537
            let sessions = await SQLSessionManager.getSessions();
            let activeSession = false;
            let found = false;
            for (let session of sessions) {
                if (!session.Started) continue;
                activeSession = true;
                let runs = await SQLRunManager.getRunsFromArray(session.Runs);
                for (let run of runs) {
                    let driver: User = await SQLUserManager.getUser(run.Driver);
                    if (!driver) continue;
                    if (driver.Discord_ID === newState.id) {
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            if (activeSession && !found && !newState.serverMute) {
                console.log(`Server muting ${newState.member.displayName}`);
                if (await UnMuteManager.hasUser(newState.member.id)) {
                    console.log(`${newState.member.displayName} is on the unmute list, and is not in the run going on. Removing them from the list`);
                    await UnMuteManager.removeUser(newState.member.id);
                }
                await newState.member.voice.setMute(true, "Joined the VC during a run");
            }else if (activeSession && !found && newState.serverMute) {
                console.log(`${newState.member.displayName} is already server muted`);
            }else if (activeSession && found && newState.serverMute) {
                console.log(`${newState.member.displayName} joined the VC while in a run`);
                if (await UnMuteManager.hasUser(newState.member.id)) {
                    console.log(`${newState.member.displayName} is on the unmute list, removing them from the list`);
                    await UnMuteManager.removeUser(newState.member.id);
                }
                await newState.member.voice.setMute(false, "Joined the VC while in a run");
            }else if (!activeSession && newState.serverMute) {
                console.log(`${newState.member.displayName} is server muted, checking unmute list`);
                if (await UnMuteManager.hasUser(newState.member.id)) {
                    console.log(`${newState.member.displayName} is on the unmute list, removing them from the list, and unmuting them`);
                    await UnMuteManager.removeUser(newState.member.id);
                    await newState.member.voice.setMute(false, "Joined the VC while there wasn't a run");
                }
            }
        }else if (newState.channelId != null) {
            if (await UnMuteManager.hasUser(newState.member.id)) {
                console.log(`${newState.member.displayName} (${newState.member.id}) is on the unmute list, removing them from the list, and unmuting them`);
                await UnMuteManager.removeUser(newState.member.id);
                await newState.member.voice.setMute(false, "Joined another VC while on the unmute list");
            }
        }
    } catch (e) {
        console.error(e);
    }
}