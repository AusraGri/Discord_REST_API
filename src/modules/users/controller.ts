import { Router } from 'express'
import type { Database } from '@/database'
import buildUsersService  from './repository'
import { jsonRoute } from '@/utils/middleware'

export default (db: Database) => {
  const router = Router()
  const userService = buildUsersService(db)

  router
  .route('/')
  .get(jsonRoute(userService.getUsers))

  return router
}
