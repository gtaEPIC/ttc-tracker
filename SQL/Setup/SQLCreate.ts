import * as fs from "fs";
const sqlite3 = require('sqlite3').verbose();

/**
 * Creates the SQLite database, if it does not exist.
 */
export default function () {
    if (!fs.existsSync(process.env.DB_PATH)) {
        new sqlite3.Database(process.env.DB_PATH, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log("Database created");
            }
        })
    }
}