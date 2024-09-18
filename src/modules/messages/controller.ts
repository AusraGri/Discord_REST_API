import { Router } from 'express'
import assert from 'assert'
import type { Database } from '@/database'
import buildRepository from './repository'
import {
  parseUsername,
  parseMessage,
  parseSprintId,
  MessageService,
} from './service'

export default (db: Database) => {
  const router = Router()

  const messagesRepository = buildRepository(db)
  const messageService = new MessageService(messagesRepository)

  router.get('/', async (req, res) => {
    try {
      const { username, sprint } = req.query

      if (username && sprint) {
        parseMessage({ username, sprint })
      } else if (username) {
        parseUsername(username)
      } else if (sprint) {
        parseSprintId(sprint)
      }

      const result = await messageService.getMessages(username, sprint)

      if (!result || result.length === 0) {
        throw new Error('No messages found')
      }

      return res.status(200).json(result)
    } catch (error) {
      assert(error instanceof Error)
      return res.status(400).json({
        error: error.message,
      })
    }
  })

  return router
}
