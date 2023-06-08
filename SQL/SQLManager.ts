import {open} from "sqlite";
import {DBConfig} from "../Extras";

export class SQLManager {
    private static queue: {query: string, promise: ((value: any) => void), reject: ((reason?: any) => void), single: boolean, attempts: number}[] = []; // SQL Command Queue
    private static executing: boolean = false; // SQL Command Executing

    private static totalTime: number = 0; // Total Time spent with the SQLite Database open

    /***
     * Adds an SQL Command to the Queue
     * @param sql SQL Command
     * @param single Request a single row
     */
    public static async addToQueue(sql: string, single: boolean): Promise<any> {
        // console.log("New SQL Command: " + sql);
        // console.log("Current Queue:", this.queue);
        return new Promise<any>((resolve, reject) => {
            this.queue.push({query: sql, promise: resolve, reject: reject, single: single, attempts: 0});
            this.executeQueue();
        });
    }

    /***
     * Adds an SQL Command to the Queue
     * @param sql SQL Command
     * @param single Request a single row
     * @param resolve Resolve Function
     */
    public static addToQueueCallback(sql: string, single: boolean, resolve: (value: any) => void): void {
        this.queue.push({query: sql, promise: resolve, reject: (reason) => console.error(reason), single: single, attempts: 0});
    }

    public static async executeQueue(): Promise<void> {
        if (this.executing) return;
        this.executing = true;
        let opened: Date = new Date();
        let db = await open(DBConfig);
        // console.log("DATABASE OPENED. COMMANDS TO EXECUTE: " + this.queue.length);
        while (this.queue.length > 0) {
            let request: {query: string, promise: ((value: any) => void), reject: ((reason?: any) => void), single: boolean, attempts: number} = this.queue.shift();
            let sql = request.query
            let resolve = request.promise;
            // console.log("EXECUTING: " + sql);
            try {
                let result = await db.all(sql);
                // console.log("RESULT: ", result);
                if (request.single) {
                    if (result.length === 0) resolve(null);
                    else resolve(result[0]);
                }else resolve(result);
                // console.log("EXECUTED, REMAINING: " + this.queue.length);
            } catch (e) {
                // Re Add to the Front of the Queue
                if (request.attempts < 10) {
                    this.queue.unshift(request);
                    console.error(e);
                }else{
                    console.error("FAILED TO EXECUTE: " + sql);
                    console.error(e);
                    request.reject(e);
                }
            }
        }
        this.executing = false;
        await db.close();
        let closed: Date = new Date();
        let diff: number = closed.getTime() - opened.getTime();
        this.totalTime += diff;
        // console.log(`Database Closed. Time taken: ${diff}ms, Total Time: ${this.totalTime}ms`);
    }

}