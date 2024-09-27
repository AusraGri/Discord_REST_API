import { Router } from 'express'
import type { Database } from '@/database'
import { buildMessageService } from './service'
import { jsonRoute } from '@/utils/middleware'
import { DiscordBotServiceInterface } from '../discord/discordBotService'
// import { DISCORD_BOT_TOKEN, CHANNEL_ID } from '@/config/config'

export default (db: Database, discordBot: DiscordBotServiceInterface) => {
  const router = Router()

  //  const discordBot = new DiscordBotService(DISCORD_BOT_TOKEN, CHANNEL_ID)

  const messageService = buildMessageService(db, discordBot)

  router
    .route('/')
    .get(jsonRoute(messageService.getMessages))
    .post(jsonRoute(messageService.sendCongratulationMessage))

  return router
}
