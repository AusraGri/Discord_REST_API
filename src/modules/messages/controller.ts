import { Router } from 'express'
import assert from 'assert'
import type { Database } from '@/database'
import buildRepository from './repository'
import type { MessageRepository, MessagesSelect } from './repository';
import {
  parseRequest,
  parsePayload,
  MessageService,
} from './service'

export default (db: Database) => {
  const router = Router()

  const messagesRepository :MessageRepository = buildRepository(db)
  const messageService = new MessageService(messagesRepository)

  router.get('/', async (req, res) => {
    try {
      const { username, sprint } = req.query

      const parsedResult = parseRequest({ username, sprint })

      if (!parsedResult.success) {
        res.status(400).json({ error: parsedResult.error.errors })
        return
      }

      const { username: validUsername, sprint: validSprint } = parsedResult.data

      const result: MessagesSelect[] | [] = await messageService.getMessages(
        validUsername,
        validSprint
      )

      if (!result || result.length === 0) {
        throw new Error('No messages found')
      }

      res.status(200).json(result)
    } catch (error) {
      assert(error instanceof Error)
      res.status(400).json({
        error: error.message,
      })
    }
  })

  router.post('/', async (req, res) => {
    try {
      const { username, sprintCode } = req.body

      const parsedResult = parsePayload({ username, sprintCode })

      if (!parsedResult.success) {
        res.status(400).json({ error: parsedResult.error.errors })
        return
      }

      const { username: validUsername, sprintCode: validSprintCode } = parsedResult.data

      const congratulationMessage = createCongratulation(username, sprintCode)

    } catch (error) {
      assert(error instanceof Error)
      res.status(400).json({
        error: error.message,
      })
    }
  })

  return router
}
