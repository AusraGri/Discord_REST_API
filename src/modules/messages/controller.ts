import { Router } from 'express'
import type { Database } from '@/database'
import { buildMessageService } from './service'
import { jsonRoute } from '@/utils/middleware'
import DiscordBotService from '../discord/discordBotService'
// import refreshUsersData from '../users/refreshUsersData'
// import Logger from '@/utils/errors/ErrorLogger'
import { DISCORD_BOT_TOKEN, CHANNEL_ID } from '@/config/config'

export default (db: Database) => {
  const router = Router()

  // const { DISCORD_BOT_TOKEN, CHANNEL_ID } = process.env

  // if (!DISCORD_BOT_TOKEN || !CHANNEL_ID) {
  //   Logger.error(
  //     'Discord bot token or channel ID is not defined in environment variables.'
  //   )
  //   process.exit(0)
  // }

   const discordBot = new DiscordBotService(DISCORD_BOT_TOKEN, CHANNEL_ID)

  // router.use(botReadyMiddleware(discordBot))

  const messageService = buildMessageService(db, discordBot)

  router
    .route('/')
    .get(jsonRoute(messageService.getMessages))
    .post(jsonRoute(messageService.sendCongratulationMessage))

  return router
}
