import { Request } from 'express'
import * as validators from './validators'
import { Database } from '@/database'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'
import buildMessageRepository from './repository'
import { DiscordBotServiceInterface } from '../discord/discordBotService'
import refreshUsersData from '../users/utils/refreshUsersData'
import getRandomTemplate from './utils/getRandomTemplate'
import buildSprintsRepository from '@/modules/sprints/repository'
import formDiscordMessage from './utils/formMessage'
import usersManager, { UsersManager } from '../users/utils/usersManager'
import getRandomImageUrl from './utils/getRandomImageUrl'
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

    const limit = userQuery.limit ? Number(userQuery.limit) : undefined
    const username = userQuery.username ? userQuery.username : undefined
    const sprint = userQuery.sprint ? userQuery.sprint : undefined

    const parsedResult = validators.validateGetMessagesRequest({
      limit,
      username,
      sprint,
    })

    const messages = await messagesRepository.getMessages({
      username: parsedResult.username,
      sprintCode: parsedResult.sprint,
      limit: parsedResult.limit,
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

    validators.validatePostMessageRequest({ username, sprintCode })

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

    if (!images || images.length < 1)
      throw new NotFound('Failed retrieve image')

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

    const isMessageDataSaved =
      await messagesRepository.insertMessage(messageData)

    if (!isMessageDataSaved)
      throw new Error('Failed to save sent message data to the database')

    return {
      message: `Message to the Discord user: ${username} was sent at: ${messageSent.createdAt}`,
    }
  }

  return { getMessages, sendCongratulationMessage }
}
