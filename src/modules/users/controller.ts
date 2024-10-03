import { Router } from 'express'
import type { Database } from '@/database'
import buildUsersService from './repository'
import { jsonRoute } from '@/utils/middleware'
import discordBotManager from '../discord/discordBotDemo'
import { DISCORD_BOT_TOKEN,CHANNEL_ID } from '@/config/config'
import userMessageService from './service'


export default (db: Database) => {
  const router = Router()
  const userService = buildUsersService(db)

  const discordBot = discordBotManager(DISCORD_BOT_TOKEN, CHANNEL_ID)
  const userSendMessage = userMessageService(discordBot)

  router
  .route('/')
  .get(jsonRoute(userService.getUsers))
  .post(jsonRoute(userSendMessage.sendMessageToDiscord))

  return router
}
