import {ISqlite, open} from 'sqlite';
import SQLCreate from "./SQLCreate";
import SQLStandard, {Types} from "./SQLStandard";
import {DBConfig, removeFromArray} from "../../Extras";

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
    await checkTable("Alerts", db, alertsStandard); // Create the "Alerts" table if it doesn't exist
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