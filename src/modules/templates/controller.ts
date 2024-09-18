import { Router } from 'express'
import assert from 'assert'
import type { Database } from '@/database'
import buildTemplateRepository from './repository'
import { parseTemplateQuery } from './service'

export default (db: Database) => {
  const router = Router()

  const templatesRepository = buildTemplateRepository(db)

  router.get('/', async (req, res) => {
    try {
      const id = req.query.id ? Number(req.query.id) : undefined
      const limit = req.query.limit ? Number(req.query.limit) : undefined
      const parsedResult = parseTemplateQuery({ id, limit })

      if (!parsedResult.success) {
        res.status(400).json({ error: parsedResult.error.errors })
        return
      }

      const { id: validId, limit: validLimit } = parsedResult.data

      const result = await templatesRepository.getTemplates(validId, validLimit)

      if (!result || result.length === 0) {
        throw new Error('No templates found')
      }

      res.status(200).json(result)
    } catch (error) {
      assert(error instanceof Error)
      res.status(400).json({
        error: error.message,
      })
    }
  })

  //   router.post('/', async (req, res) => {
  //     try {
  //       const { username, sprintCode } = req.body

  //       const parsedResult = parsePayload({ username, sprintCode })

  //       if (!parsedResult.success) {
  //         res.status(400).json({ error: parsedResult.error.errors })
  //         return
  //       }

  //       const { username: validUsername, sprintCode: validSprintCode } = parsedResult.data

  //       const congratulationMessage = createCongratulation(username, sprintCode)

  //     } catch (error) {
  //       assert(error instanceof Error)
  //       res.status(400).json({
  //         error: error.message,
  //       })
  //     }
  //   })

  return router
}
