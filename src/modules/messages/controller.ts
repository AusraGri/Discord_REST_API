import { Router } from 'express'
import type { Database } from '@/database'
import { buildMessageService } from './service'
import { jsonRoute } from '@/utils/middleware'
import DiscordBotService from '../discord/discordServide'


export default (db: Database) => {
  const router = Router()

  const { DISCORD_BOT_TOKEN, CHANNEL_ID } = process.env

  if (!DISCORD_BOT_TOKEN || !CHANNEL_ID) {
      throw new Error('Discord bot token or channel ID is not defined in environment variables.');
    }
  const discordBot = new DiscordBotService(DISCORD_BOT_TOKEN, CHANNEL_ID);
  const users = discordBot.getAllUsersFromChannel()
  const messageService = buildMessageService(db, discordBot) // Inject the db and get the service functions

  router
  .route('/')
  .get(jsonRoute(messageService.getMessages))
  .post(jsonRoute(messageService.createCongratulation))

  return router
}
