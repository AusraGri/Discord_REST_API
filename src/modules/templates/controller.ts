import { Router } from 'express'
import assert from 'assert'
import type { Database } from '@/database'
import buildTemplateRepository, { TemplatesSelect } from './repository'
import {
  parseTemplateQuery,
  parseTemplateText,
  parseTemplateUpdatable,
} from './service'
import { buildTemplateService } from './newservice'

export default (db: Database) => {
  const router = Router()
  const templateService = buildTemplateService(db)
  // const templatesRepository = buildTemplateRepository(db)

  router
  .get('/', templateService.getTemplates)
  .post('/', templateService.postTemplates)
  .patch('/', templateService.patchTemplates)

  // router.get('/', async (req, res) => {
  //   try {
  //     const id = req.query.id ? Number(req.query.id) : undefined
  //     const limit = req.query.limit ? Number(req.query.limit) : undefined
  //     const parsedResult = parseTemplateQuery({ id, limit })

  //     if (!parsedResult.success) {
  //       res.status(400).json({ error: parsedResult.error.errors })
  //       return
  //     }

  //     const { id: validId, limit: validLimit } = parsedResult.data

  //     const result = await templatesRepository.getTemplates({
  //       id: validId,
  //       limit: validLimit,
  //     })

  //     if (!result || result.length === 0) {
  //       throw new Error('No templates found')
  //     }

  //     res.status(200).json(result)
  //   } catch (error) {
  //     assert(error instanceof Error)
  //     res.status(400).json({
  //       error: error.message,
  //     })
  //   }
  // })

  // router.post('/', async (req, res) => {
  //   try {
  //     const { text } = req.body

  //     const parsedResult = parseTemplateText({ text })

  //     if (!parsedResult.success) {
  //       const errorMessages = parsedResult.error.errors.map(
  //         (err) => err.message
  //       )
  //       res.status(400).json({ error: errorMessages })
  //       return
  //     }
  //     const result: TemplatesSelect = await templatesRepository.insertTemplate({
  //       text,
  //     })

  //     res.status(201).json(result)
  //   } catch (error) {
  //     assert(error instanceof Error)
  //     res.status(400).json({
  //       error: error.message,
  //     })
  //   }
  // })

  // router.patch('/', async (req, res) => {
  //   try {
  //     const updatedTemplate = req.body

  //     const parsedResult = parseTemplateUpdatable(updatedTemplate)

  //     if (!parsedResult.success) {
  //       const errorMessages = parsedResult.error.errors.map(
  //         (err) => err.message
  //       )
  //       res.status(400).json({ error: errorMessages })
  //       return
  //     }
  //     const result: TemplatesSelect = await templatesRepository.patchTemplate(
  //       parsedResult.data
  //     )

  //     res.status(200).json(result)
  //   } catch (error) {
  //     assert(error instanceof Error)
  //     res.status(400).json({
  //       error: error.message,
  //     })
  //   }
  // })

  return router
}
