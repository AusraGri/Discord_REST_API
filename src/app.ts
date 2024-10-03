import express from 'express'
import jsonErrorHandler from './middleware/jsonErrors'
import { type Database } from './database'
import messages from './modules/messages/controller'
import templates from './modules/templates/controller'
import sprints from './modules/sprints/controller'
import users from './modules/users/controller'
import DiscordBotService from './modules/discord/discordBotService'
import { DISCORD_BOT_TOKEN, CHANNEL_ID } from './config/config'
// import discordBotManager from './modules/discord/discordBotDemo'

export default function createApp(db: Database) {
  const app = express()

  const discordBot = new DiscordBotService(DISCORD_BOT_TOKEN, CHANNEL_ID)
// const discordBot = discordBotManager(DISCORD_BOT_TOKEN, CHANNEL_ID)
  app.use(express.json())

  app.use('/messages', messages(db, discordBot))
  app.use('/templates', templates(db))
  app.use('/sprints', sprints(db))
  app.use('/users', users(db))

  app.use(jsonErrorHandler)

  return app
}
