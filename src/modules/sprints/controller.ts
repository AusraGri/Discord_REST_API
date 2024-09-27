import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { Database } from '@/database'
import { buildSprintService } from './service'
import { jsonRoute, unsupportedRoute } from '@/utils/middleware'

export default (db: Database) => {
  const router = Router()
  const sprintService = buildSprintService(db)

  router
  .route('/')
  .get(jsonRoute(sprintService.getSprints))
  .post(jsonRoute(sprintService.postSprints, StatusCodes.CREATED))
  // .patch(jsonRoute(sprintService.patchSprints))

  router
  .route('/:id')
  .delete(jsonRoute(sprintService.deleteSprints))
  .patch(jsonRoute(sprintService.patchSprints))
  .get(unsupportedRoute)
  .post(unsupportedRoute)
  .patch(unsupportedRoute)

  return router
}