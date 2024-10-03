import { Request } from 'express'
import { DiscordBotManager } from '../discord/discordBotDemo'

const userMessageService = (discordBot: DiscordBotManager) => {
    discordBot.initClient()
  const sendMessageToDiscord = async (req: Request) => {
    await discordBot.sendMessage('hello!')
    return 'success'
  }
  return { sendMessageToDiscord }
}

export default userMessageService
