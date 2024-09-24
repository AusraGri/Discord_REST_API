import express from 'express'
import jsonErrorHandler from './middleware/jsonErrors'
import { type Database } from './database'
import messages from './modules/messages/controller'
import templates from './modules/templates/controller'
import sprints from './modules/sprints/controller'


export default function createApp(db: Database) {
  const app = express()

  app.use(express.json())

//   const { DISCORD_BOT_TOKEN, CHANNEL_ID } = process.env

// if (!DISCORD_BOT_TOKEN || !CHANNEL_ID) {
//     throw new Error('Discord bot token or channel ID is not defined in environment variables.');
//   }
//   const discordBot = new DiscordBotService(DISCORD_BOT_TOKEN, CHANNEL_ID);
  // register your controllers here
  app.use('/messages', messages(db))
  app.use('/templates', templates(db))
  app.use('/sprints', sprints(db))

  app.use(jsonErrorHandler)

  return app
}
