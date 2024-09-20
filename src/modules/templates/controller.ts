import { Router } from 'express'
import type { Database } from '@/database'
import { buildTemplateService } from './service'

export default (db: Database) => {
  const router = Router()
  const templateService = buildTemplateService(db)

  router
  .get('/', templateService.getTemplates)
  .post('/', templateService.postTemplates)
  .patch('/', templateService.patchTemplates)
  .delete('/:id', templateService.deleteTemplates)

  return router
}
