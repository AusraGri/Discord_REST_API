import { Request, Response, NextFunction } from 'express'
import Logger from '@/utils/errors/ErrorLogger'
import DiscordBotService from '@/modules/discord/discordBotService'

export const botReadyMiddleware =
  (discordBot: DiscordBotService) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await discordBot.awaitReady()
      next()
    } catch (error) {
      Logger.error(`Error in bot readiness: ${error}`)
      next(error)
    }
  }
