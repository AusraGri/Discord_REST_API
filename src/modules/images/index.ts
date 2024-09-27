import { Database } from '@/database'
import { ImagesManager } from './fetchImages'
import saveImages from './saveImages'
import Logger from '@/utils/errors/ErrorLogger'
import { KEYWORDS } from '@/config/config'

export default async function fetchAndStoreImages(
  db: Database,
  imagesManager: ImagesManager
) {
  try {
    const images = await imagesManager.getGifs(KEYWORDS)

    if (!images || images.length < 1) throw new Error('Failed to fetch images')

    const isImagesSaved = await saveImages(db, images)

    if (!isImagesSaved) throw new Error('failed to save images')
  } catch (error) {
    const message = (error as Error).message || 'Unknown error occurred'
    Logger.error(message)
    process.exit(1)
  }
}
