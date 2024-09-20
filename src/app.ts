import express from 'express'
import jsonErrorHandler from './middleware/jsonErrors'
import { type Database } from './database'
import messages from './modules/messages/controller'
import templates from './modules/templates/controller'
import sprints from './modules/sprints/controller'


export default function createApp(db: Database) {
  const app = express()

  app.use(express.json())

  // register your controllers here
  app.use('/messages', messages(db))
  app.use('/templates', templates(db))
  app.use('/sprints', sprints(db))

  app.use(jsonErrorHandler)

  return app
}
