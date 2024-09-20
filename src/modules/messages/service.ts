import { Request, Response, NextFunction } from 'express'
import {
  validateGetMessagesRequest,
  validatePostMessageRequest,
} from './validators'
import buildMessageRepository from './repository'
import { Database } from '@/database'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'

export const buildMessageService = (db: Database) => {
  const messagesRepository = buildMessageRepository(db)

  const getMessages = async (req: Request) => {
    const userQuery = { ...req.query }
    const parsedResult = validateGetMessagesRequest(userQuery)

    const {limit} = parsedResult
    const {username} = parsedResult
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
    res: Response,
    next: NextFunction
  ) => {
    try {
      const parsedResult = validatePostMessageRequest(req.body)
      if (!parsedResult.success) {
        return res.status(400).json({ error: parsedResult.error.errors })
      }

      const template = await getTemplate() // Fetch a random template
      if (!template) throw new Error('No template found')

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
