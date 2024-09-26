import { Database } from "@/database";
import buildImagesRepository, { ImagesInsert }  from './repository'

export default async function saveImages (db: Database, images: ImagesInsert[]){
const imagesRepository = buildImagesRepository(db)
await imagesRepository.deleteImages()

if(!images || images.length < 1)
    throw new Error('No images to save')

await imagesRepository.insertImages(images)

return true
}