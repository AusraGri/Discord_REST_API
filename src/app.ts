import express from 'express'
import jsonErrorHandler from './middleware/jsonErrors'
import { type Database } from './database'
import messages from './modules/messages/controller'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function createApp(db: Database) {
  const app = express()

  app.use(express.json())

  // register your controllers here
  app.use('/messages', messages(db))

  app.use(jsonErrorHandler)

  return app
}
