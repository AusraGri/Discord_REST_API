import { Request, Response, NextFunction } from 'express'
import { EmbedBuilder, userMention } from 'discord.js'
import {
  validateGetMessagesRequest,
  validatePostMessageRequest,
} from './validators'
import buildMessageRepository from './repository'
import { Database } from '@/database'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'
import DiscordBotService from '../discord/discordServide'
// import discordBot from '../discord/discordClient'

export const buildMessageService = (db: Database, discordBot: DiscordBotService) => {
  const messagesRepository = buildMessageRepository(db)

  const getMessages = async (req: Request) => {
    const userQuery = { ...req.query }
    const parsedResult = validateGetMessagesRequest(userQuery)

    const { limit } = parsedResult
    const { username } = parsedResult
    const sprintCode = parsedResult.sprint
    const messages = await messagesRepository.getMessages({
      username,
      sprintCode,
      limit,
    })

    if (!messages || messages.length === 0) {
      throw new NotFound('No messages found')
    }
    return messages
  }

  const createCongratulation = async (
    req: Request,
  ) => {

    const user = userMention('962096516175114271')
    const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Mention Example')
    .setDescription(`Hello ${user}, this is your mention in an embed!`)
    .setTimestamp();
    if (discordBot.isBotReady()) {
      await discordBot.sendMessage({ embeds: [embed] });
      const users = await discordBot.getAllUsersFromChannel()
     await discordBot.sendMessage(`${users[0].id} and ${users[0].username}`)
  }

    // const parsedResult = validatePostMessageRequest(req.body)

    // const template = await getTemplate() // Fetch a random template
    // if (!template) throw new Error('No template found')

    // const { username, sprintCode } = parsedResult.data
    // const message = createCongratulationMessage(username, sprintCode)

    // await messagesRepository.saveMessage(message)

    // res.status(201).json({ message: 'Message created successfully' })

    return 'success'
  }

  return { getMessages, createCongratulation }
}
