import {ISqlite} from "sqlite";

export class SQLStandardOptions {
    name: string;
    type: Types = Types.TEXT;
    default?: any;
    unique?: boolean;
    primary?: boolean;
    notNull?: boolean;
}

export default class SQLStandard {
    name: string;
    type: Types = Types.TEXT;
    default: any;
    unique: boolean = false;
    primary: boolean = false;
    notNull: boolean = false;


    constructor(options: SQLStandardOptions) {
        this.name = options.name;
        this.type = options.type;
        if (options.default) this.default = options.default;
        if (options.unique) this.unique = options.unique;
        if (options.primary) this.primary = options.primary;
        if (options.notNull) this.notNull = options.notNull;
    }

    init?(): ISqlite.SqlType {
        let final: ISqlite.SqlType = this.name + ' ' + this.type;
        if (this.default) final += ' default ' + this.default;
        if (this.unique) final += ' unique';
        if (this.primary) final += ' primary key';
        if (this.notNull) final += ' not null';
        return final;
    }
}

export enum Types {
    TEXT = "TEXT",
    INTEGER = "INTEGER",
    BOOLEAN = "BOOLEAN"
}