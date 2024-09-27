import { Request } from 'express'
import {
  validateGetMessagesRequest,
  validatePostMessageRequest,
} from './validators'
import buildMessageRepository from './repository'
import { Database } from '@/database'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'
import { DiscordBotServiceInterface } from '../discord/discordBotService'
import refreshUsersData from '../users/utils/refreshUsersData'
import getRandomTemplate from './utils/getTemplate'
import buildSprintsRepository from '@/modules/sprints/repository'
import formDiscordMessage from './utils/formMessage'
import usersManager, { UsersManager } from '../users/utils/usersManager'
import getRandomImageUrl from './utils/getRandomImage'
import buildImageRepository from '@/modules/images/repository'

export const buildMessageService = (
  db: Database,
  discordBot: DiscordBotServiceInterface
) => {
  const messagesRepository = buildMessageRepository(db)
  const imageRepository = buildImageRepository(db)

  refreshUsersData(db, discordBot)

  // Manages endpoint requests for getting messages / GET
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

  // Manages endpoint requests for sending messages to Discord / POST
  const sendCongratulationMessage = async (req: Request) => {
    const sprintsRepository = buildSprintsRepository(db)

    const { username, sprintCode } = req.body

    validatePostMessageRequest({ username, sprintCode })

    const users: UsersManager = usersManager(db, discordBot)

    const user = await users.getUser(username)

    if (!user) throw new NotFound('Username does not exist in the Discord')

    const template = await getRandomTemplate(db)

    const [sprint] = await sprintsRepository.getSprints({ sprintCode })

    if (!sprint)
      throw new BadRequest('Sprint code is invalid. Not found in the database')

    const message = await formDiscordMessage({
      template: template.text,
      user,
      sprintTitle: sprint.fullTitle,
    })

    const images = await imageRepository.getImages()

    const url = getRandomImageUrl(images)

    const messageSent = await discordBot.sendMessage({
      content: `${message}`,
      files: [url],
    })

    if (!messageSent) throw new Error('Failed to send the message')

    const messageData = {
      gifUrl: url,
      originalMessage: messageSent.content,
      sprintCode,
      sprintId: sprint.id,
      sprintTitle: sprint.fullTitle,
      templateId: template.id,
      templateText: template.text,
      username,
    }

    const isMessageDataSaved = await messagesRepository.insertMessage(messageData)

    if (!isMessageDataSaved)
      throw new Error('Failed to save sent message data to the database')

    return {message: `Message to the Discord user: ${username} was sent at: ${messageSent.createdAt}` }
  }

  return { getMessages, sendCongratulationMessage }
}

// const request = {
//   username: 'bcor_',
//   sprintCode: 'WD-1.1',
// }
// const request1 = {
//   username: 'kinoreples',
//   sprintCode: 'WD-8.1',
// }
