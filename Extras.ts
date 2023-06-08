import * as sqlite3 from "sqlite3";
require("dotenv").config();

/**
 * Removes a specific value from an array
 * @param toRemove The key that will be removed
 * @param array The array to remove the key from
 */
export function removeFromArray(toRemove: any, array: Array<any>) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === toRemove) {
            array.splice(i,1);
            return
        }
    }
}

// The default database to use
export const DBConfig = {
    filename: process.env.DB_PATH || "./database.db",
    driver: sqlite3.Database
}

function fixStrings(string: String) {
    for (let i = 0; i < string.length; i++) {
        if (string[i] === "'") {
            string = string.substring(0, i + 1) + "'" + string.substring(i + 1);
            i+=2;
        }
    }
    return string;
}

export function formatArray(array): string {
    let data = "";
    for (let arrayElement of array) {
        // If the array element is a string, surround it with quotes
        if (arrayElement === null || arrayElement === undefined) {
            data += "NULL";
        } else if (typeof arrayElement === "string") {
            data += `'${fixStrings(arrayElement)}'`;
        } else {
            data += arrayElement.toString();
        }
        data += ", ";
    }
    return data.substring(0, data.length - 2);
}

export interface result {
    success: boolean;
    message: string;
}

