import { Request, Response, NextFunction } from 'express'
import {
  validateGetMessagesRequest,
  validatePostMessageRequest,
} from './validators'
import buildMessageRepository from './repository'
import { MessageService } from './service'
import { Database } from '@/database'
import ClientError from '@/errors/ClientError'

export const buildMessageService = (db: Database) => {
  const messagesRepository = buildMessageRepository(db)
  const messageServices = new MessageService(messagesRepository)

  const getMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userQuery = { ...req.query }
      const parsedResult = validateGetMessagesRequest(userQuery)
    //   if (!parsedResult.success) {
    //     return res.status(400).json({ error: parsedResult.error.errors })
    //   } 

      const username = parsedResult.data?.username
      const sprint = parsedResult.data?.sprint
      const messages = await messageServices.getMessages(username, sprint)

      if (!messages || messages.length === 0) {
        throw new ClientError('No messages found')
      }

      res.status(200).json(messages)
    } catch (error) {
      next(error)
    }
  }

  const createCongratulation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const parsedResult = validatePostMessageRequest(req.body)
      if (!parsedResult.success) {
        return res.status(400).json({ error: parsedResult.error.errors })
      }

      const template = await getTemplate(); // Fetch a random template
    if (!template) throw new Error('No template found');

      const { username, sprintCode } = parsedResult.data
      const message = createCongratulationMessage(username, sprintCode)

      await messagesRepository.saveMessage(message)

      res.status(201).json({ message: 'Message created successfully' })
    } catch (error) {
      next(error)
    }
  }

  return { getMessages, createCongratulation }
}
