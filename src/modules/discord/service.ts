import discordBot from "./discordClient";

const { DISCORD_BOT_TOKEN, CHANNEL_ID } = process.env

if (!DISCORD_BOT_TOKEN || !CHANNEL_ID) {
    throw new Error('Discord bot token or channel ID is not defined in environment variables.');
  }

const  discordClient = discordBot(DISCORD_BOT_TOKEN, CHANNEL_ID)
