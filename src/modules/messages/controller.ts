import { Router } from 'express'
import type { Database } from '@/database'
import { buildMessageService } from './service'
import { jsonRoute, unsupportedRoute } from '@/utils/middleware'

export default (db: Database) => {
  const router = Router()

  const messageService = buildMessageService(db) // Inject the db and get the service functions

  router.route('/').get(jsonRoute(messageService.getMessages))

  // router.post('/', async (req, res) => {
  //   try {
  //     const { username, sprintCode } = req.body

  //     const parsedResult = parsePayload({ username, sprintCode })

  //     if (!parsedResult.success) {
  //       res.status(400).json({ error: parsedResult.error.errors })
  //       return
  //     }

  //     const { username: validUsername, sprintCode: validSprintCode } =
  //       parsedResult.data

  //     const congratulationMessage = createCongratulation(username, sprintCode)
  //   } catch (error) {
  //     assert(error instanceof Error)
  //     res.status(400).json({
  //       error: error.message,
  //     })
  //   }
  // })

  return router
}
