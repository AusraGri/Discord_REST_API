import Logger from "@/utils/errors/ErrorLogger"


const { DISCORD_BOT_TOKEN, CHANNEL_ID, DATABASE_URL, GIPHY_API_KEY } =
  process.env as {
    DISCORD_BOT_TOKEN: string
    CHANNEL_ID: string
    DATABASE_URL: string
    GIPHY_API_KEY: string
  }

if (!DISCORD_BOT_TOKEN || !CHANNEL_ID || !DATABASE_URL || !GIPHY_API_KEY) {
    Logger.error('Missing environment variables')
    process.exit(1)
  }

export {DISCORD_BOT_TOKEN, CHANNEL_ID, DATABASE_URL, GIPHY_API_KEY}