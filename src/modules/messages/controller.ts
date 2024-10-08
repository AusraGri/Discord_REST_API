import { Router } from 'express'
import type { Database } from '@/database'
import { buildMessageService } from './service'
import { jsonRoute, unsupportedRoute } from '@/utils/middleware'
import { DiscordBotServiceInterface } from '../discord/discordBotService'

export default (db: Database, discordBot: DiscordBotServiceInterface) => {
  const router = Router()

  const messageService = buildMessageService(db, discordBot)

  router
    .route('/')
    .get(jsonRoute(messageService.getMessages))
    .post(jsonRoute(messageService.sendCongratulationMessage))
    .patch(unsupportedRoute)
    .delete(unsupportedRoute)

  return router
}
