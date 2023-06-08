import {ISqlite, open} from 'sqlite';
import SQLCreate from "./SQLCreate";
import SQLStandard, {Types} from "./SQLStandard";
import {DBConfig, removeFromArray} from "../../Extras";
import {defaultBlocks} from "./Default/DefaultBlocks";
import SQLDefaultBlockManager from "../BlockManager/SQLDefaultBlockManager";

export const userStandard: SQLStandard[] = [
    new SQLStandard({
        name: "Badge_ID",
        type: Types.INTEGER,
        primary: true,
        unique: true,
        notNull: true,
    }),
    new SQLStandard({
        name: "Password",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Discord_ID",
        type: Types.TEXT,
        unique: true,
        notNull: true,
    }),
    new SQLStandard({
        name: "Email",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Warnings",
        type: Types.TEXT,
        default: 0
    }),
    new SQLStandard({
        name: "Operator_Rank",
        type: Types.INTEGER,
        default: 0
    }),
    new SQLStandard({
        name: "Controller_Rank",
        type: Types.INTEGER,
        default: 0
    }),
    new SQLStandard({
        name: "Money",
        type: Types.INTEGER,
        default: 0,
        notNull: true
    }),
    new SQLStandard({
        name: "IPS",
        type: Types.TEXT,
        default: "[]",
    }),
    new SQLStandard({
        name: "Discord_AUTH",
        type: Types.TEXT,
        default: null
    }),
    new SQLStandard({
        name: "Runs_Attended",
        type: Types.INTEGER,
        default: 0
    }),
];
export const warningStandard: SQLStandard[] = [
    new SQLStandard({
        name: "Warning_ID",
        type: Types.INTEGER,
        primary: true,
        unique: true,
        notNull: true,
    }),
    new SQLStandard({
        name: "Affects",
        type: Types.INTEGER,
        notNull: true,
    }),
    new SQLStandard({
        name: "Reason",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Expires",
        type: Types.INTEGER,
        notNull: true,
    })
];
export const sessionStandard: SQLStandard[] = [
    new SQLStandard({
        name: "Session_ID",
        type: Types.INTEGER,
        primary: true,
        unique: true,
        notNull: true,
    }),
    new SQLStandard({
        name: "Host",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Name",
        type: Types.TEXT,
        notNull: true
    }),
    new SQLStandard({
        name: "Description",
        type: Types.TEXT,
        notNull: true
    }),
    new SQLStandard({
        name: "Line",
        type: Types.INTEGER,
        notNull: true
    }),
    new SQLStandard({
        name: "Required",
        type: Types.INTEGER,
        notNull: true
    }),
    new SQLStandard({
        name: "Notes",
        type: Types.TEXT,
        notNull: true
    }),
    new SQLStandard({
        name: "Guild",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Channel",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Message",
        type: Types.TEXT,
    }),
    new SQLStandard({
        name: "Updater",
        type: Types.TEXT,
    }),
    new SQLStandard({
        name: "Start_Time",
        type: Types.INTEGER,
        notNull: true,
    }),
    new SQLStandard({
        name: "Blocks",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Events",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Runs",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Changed",
        type: Types.BOOLEAN,
        default: false,
    }),
    new SQLStandard({
        name: "Started",
        type: Types.BOOLEAN,
        default: false,
    }),
    new SQLStandard({
        name: "Warned",
        type: Types.BOOLEAN,
        default: false,
    }),
    new SQLStandard({
        name: "HeadsUp",
        type: Types.INTEGER,
        default: 0,
    }),
    new SQLStandard({
        name: "Selections",
        type: Types.TEXT,
        default: "[]",
    }),
    new SQLStandard({
        name: "Controllers",
        type: Types.TEXT,
        notNull: true,
    }),
];
export const blockStandard: SQLStandard[] = [
    new SQLStandard({
        name: "Block_ID",
        type: Types.INTEGER,
        primary: true,
        unique: true,
        notNull: true,
    }),
    new SQLStandard({
        name: "Block_Name",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Station_Name",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Is_X_Signal",
        type: Types.BOOLEAN,
        notNull: true,
    }),
    new SQLStandard({
        name: "Is_Automatic",
        type: Types.BOOLEAN,
        notNull: true,
    }),
    new SQLStandard({
        name: "Trains",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Last_Activity",
        type: Types.INTEGER,
        notNull: true,
    }),
    new SQLStandard({
        name: "Signal_State",
        type: Types.INTEGER,
        notNull: true,
    }),
    new SQLStandard({
        name: "Is_Signal",
        type: Types.BOOLEAN,
        notNull: true,
        default: true,
    }),
    new SQLStandard({
        name: "Main",
        type: Types.TEXT
    }),
    new SQLStandard({
        name: "Side",
        type: Types.TEXT
    }),
    new SQLStandard({
        name: "Switch",
        type: Types.TEXT
    }),
    new SQLStandard({
        name: "Code",
        type: Types.INTEGER,
        notNull: true,
    }),
    new SQLStandard({
        name: "Display_Depart",
        type: Types.BOOLEAN,
        notNull: true,
    }),
    new SQLStandard({
        name: "Display_enroutes",
        type: Types.BOOLEAN,
        notNull: true,
    }),
    new SQLStandard({
        name: "Direction",
        type: Types.INTEGER,
        notNull: true,
    }),
    new SQLStandard({
        name: "Timer_ID",
        type: Types.INTEGER,
    }),
];
export const eventStandard: SQLStandard[] = [
    new SQLStandard({
        name: "Event_ID",
        type: Types.INTEGER,
        primary: true,
        unique: true,
        notNull: true,
    }),
    new SQLStandard({
        name: "Event_Name",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Type",
        type: Types.INTEGER,
        notNull: true,
    }),
    new SQLStandard({
        name: "Chance",
        type: Types.INTEGER,
        notNull: true,
    }),
    new SQLStandard({
        name: "Severity",
        type: Types.INTEGER,
        notNull: true,
    }),
];
export const runStandard: SQLStandard[] = [
    new SQLStandard({
        name: "Run_ID",
        type: Types.INTEGER,
        primary: true,
        unique: true,
        notNull: true,
    }),
    new SQLStandard({
        name: "Driver",
        type: Types.INTEGER,
    }),
    new SQLStandard({
        name: "Destination",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Location",
        type: Types.INTEGER,
        notNull: true,
    }),
    new SQLStandard({
        name: "Events",
        type: Types.TEXT,
        notNull: true,
    }),
    new SQLStandard({
        name: "Departed",
        type: Types.INTEGER,
    }),
    new SQLStandard({
        name: "Delay",
        type: Types.INTEGER,
    }),
    new SQLStandard({
        name: "Last_Activity",
        type: Types.INTEGER,
    }),
    new SQLStandard({
        name: "Train",
        type: Types.TEXT,
    }),
    new SQLStandard({
        name: "Doors",
        type: Types.INTEGER,
    }),
    new SQLStandard({
        name: "Attended",
        type: Types.BOOLEAN,
        default: false
    }),
    new SQLStandard({
        name: "Expected",
        type: Types.INTEGER,
        default: 0,
    }),
];

export const webSessionStandard: SQLStandard[] = [
    new SQLStandard({
        name: "Session_ID",
        type: Types.TEXT,
        unique: true,
        notNull: true,
    }),
    new SQLStandard({
        name: "User_ID",
        type: Types.INTEGER,
        notNull: true,
    }),
    new SQLStandard({
        name: "Session_Type",
        type: Types.INTEGER,
        notNull: true,
    }),
    new SQLStandard({
        name: "Expires",
        type: Types.INTEGER,
    })
];

export const ipBansStandard: SQLStandard[] = [
    new SQLStandard({
        name: "IP",
        type: Types.TEXT,
        unique: true,
        notNull: true,
    }),
    new SQLStandard({
        name: "Expires",
        type: Types.INTEGER,
        notNull: true,
    }),
    new SQLStandard({
        name: "Reason",
        type: Types.TEXT,
        notNull: true,
    }),
];

export const alertsStandard: SQLStandard[] = [
    new SQLStandard({
        name: "Alert_ID",
        type: Types.INTEGER,
        primary: true,
        unique: true,
        notNull: true,
    }),
    new SQLStandard({
        name: "Type",
        type: Types.INTEGER,
    }),
    new SQLStandard({
        name: "Type_Name",
        type: Types.TEXT,
    }),
    new SQLStandard({
        name: "Message",
        type: Types.TEXT,
    }),
    new SQLStandard({
        name: "Started",
        type: Types.INTEGER,
    }),
    new SQLStandard({
        name: "Expires",
        type: Types.INTEGER,
    }),
    new SQLStandard({
        name: "Points",
        type: Types.TEXT,
    }),
    new SQLStandard({
        name: "User",
        type: Types.TEXT,
    }),
    new SQLStandard({
        name: "Discord_Message",
        type: Types.TEXT,
    }),
    new SQLStandard({
        name: "Line",
        type: Types.TEXT,
    })
];


/**
 * Sets up the database.
 * @author gtaEPIC
 */
export default async function () {
    SQLCreate();
    const db = await open(DBConfig);


    await checkTable("Users", db, userStandard); // Create the "Users" table if it doesn't exist
    await checkTable("De_Blocks", db, blockStandard); // Create the default blocks table if it doesn't exist
    await checkTable("De_Events", db, eventStandard); // Create the default events table if it doesn't exist
    await checkTable("Runs", db, runStandard); // Create the "Runs" table if it doesn't exist
    await checkTable("Warnings", db, warningStandard); // Create the "Warnings" table if it doesn't exist
    await checkTable("Sessions", db, sessionStandard); // Create the "Sessions" table if it doesn't exist

    await checkTable("Blocks", db, blockStandard); // Create the "Blocks" table if it doesn't exist
    await checkTable("Events", db, eventStandard); // Create the "Events" table if it doesn't exist

    await checkTable("Web_Sessions", db, webSessionStandard); // Create the "Web_Sessions" table if it doesn't exist

    await checkTable("IP_Bans", db, ipBansStandard); // Create the "IP_Bans" table if it doesn't exist

    await checkTable("Alerts", db, alertsStandard); // Create the "Alerts" table if it doesn't exist

    for (let defaultBlock of defaultBlocks) {
        await SQLDefaultBlockManager.setBlock(defaultBlock);
    }
}

/**
 * Makes sure a table in the database exists.
 * @param tableName Name of the table.
 * @param db Database to use.
 * @param standards Standard columns to add.
 */
async function checkTable(tableName: string, db, standards: SQLStandard[]) {
    try {
        let columns: ISqlite.SqlType = '';
        let allNames: Array<SQLStandard> = [];
        for (let standard of standards) {
            columns += standard.init() + ',';
            allNames.push(standard);
        }
        columns = columns.substring(0, columns.length - 1);
        //console.log(columns);
        await db.exec('CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + columns + ')');
        let result = await db.all('PRAGMA table_info (' + tableName + ')');
        let names: Array<SQLStandard> = [];
        for (let resultElement of result) {
            names.push(new SQLStandard({
                name: resultElement.name,
                type: resultElement.type
            }));
        }
        for (let name of names) {
            for (let allName of allNames) {
                if (name.name === allName.name) {
                    removeFromArray(allName, allNames);
                    break;
                }
            }
        }
        for (let missing of allNames) {
            await db.exec('ALTER TABLE ' + tableName + ' ADD ' + missing.name + ' ' + missing.type);
            console.log("Added New Column to " + tableName + ": " + missing.name + ' ' + missing.type);
        }
        //console.log(result);
    }catch (e) {
        console.log(e)
    }
}