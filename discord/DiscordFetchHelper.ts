import {
    Channel,
    ChannelType,
    Client,
    Guild,
    GuildEmoji,
    GuildMember,
    Message,
    Snowflake,
    TextChannel,
    User
} from "discord.js";

export class DiscordFetchHelpers {
    static async findGuild(client: Client, id: Snowflake): Promise<Guild | null> {
        try {
            const cachedGuild = client.guilds.cache.get(id);
            return cachedGuild ? cachedGuild : await client.guilds.fetch(id);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    static async findChannel(client: Client, guild: Guild, id: Snowflake): Promise<Channel | null> {
        const cachedChannel = guild.channels.cache.get(id)
        return cachedChannel ? cachedChannel : await guild.channels.fetch(id)
    }

    static async searchChannel(client: Client, id: Snowflake): Promise<Channel | null> {
        let channel: Channel = <Channel>client.channels.cache.get(id)
        if (channel) return channel
        return new Promise( (resolve) => {
            client.guilds.cache.forEach(async guild => {
                try {
                    const channel = await this.findChannel(client, guild, id)
                    // console.log(guild)
                    if (channel) {
                        resolve(channel);
                    }
                } catch (e) {
                    console.log("Error searching for channel: " + e)
                    // reject(e);
                }
            })
            resolve(null)
        })
    }

    static async findMessage(client: Client, channel: TextChannel, id: Snowflake): Promise<Message | null> {
        const cachedChannel = channel.messages.cache.get(id)
        return cachedChannel ? cachedChannel : await channel.messages.fetch(id)
    }

    static async findUser(client: Client, id: Snowflake): Promise<User | null> {
        const cachedChannel = client.users.cache.get(id)
        return cachedChannel ? cachedChannel : await client.users.fetch(id)
    }

    static async findGuildMember(client: Client, guild: Guild, id: Snowflake): Promise<GuildMember | null> {
        try {
            const cachedChannel = guild.members.cache.get(id)
            return cachedChannel ? cachedChannel : await guild.members.fetch(id)
        } catch (e) {
            console.error(e)
            return null
        }
    }

    static checkForRole(client: Client, member: GuildMember, id: Snowflake): boolean {
        return member.roles.cache.has(id)
    }

    /**
     * @deprecated
     * @param client
     * @param id
     */
    static async searchMessage(client: Client, id: Snowflake): Promise<Message | null> {
        let final;
        await Promise.all(client.guilds.cache.map((guild) => {
            guild.channels.cache.map(async (channel:TextChannel) => {
                if (channel.type === ChannelType.GuildText) {
                    final = await this.findMessage(client, channel, id)
                }
            })
        }))
        return final;
    }

    static async getGuildEmoji(client: Client, guild: Guild, id: Snowflake): Promise<GuildEmoji | null> {
        const cachedEmoji = guild.emojis.cache.get(id)
        return cachedEmoji ? cachedEmoji : await guild.emojis.fetch(id)
    }
}