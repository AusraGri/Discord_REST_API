import 'dotenv/config'
import createApp from './app'
import createDatabase from './database'
import Logger from './utils/errors/ErrorLogger'
import { DATABASE_URL, GIPHY_API_KEY } from './config/config'
import buildImagesManager from './modules/images/fetchImages'
import fetchAndStoreImages from './modules/images'

const PORT = 3000

const database = createDatabase(DATABASE_URL)
const app = createApp(database)

;(async () => {
  try {
    const imagesManager = buildImagesManager(GIPHY_API_KEY)

    await fetchAndStoreImages(database, imagesManager)

    Logger.info('Images fetched and stored in the database successfully.')

    app.listen(PORT, () => {
      Logger.info(`Server is running at http://localhost:${PORT}`)
    })
  } catch (error) {
    const message = (error as Error).message || 'Unknown error occurred'
    Logger.error(`Error during server startup: ${message}`)
    process.exit(1)
  }
})()
