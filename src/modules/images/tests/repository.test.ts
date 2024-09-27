import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import cleanDatabase from '@tests/utils/createTestDatabase/cleanDatabase'
import buildImageRepository, { ImagesRepository } from '../repository'

const db = await createTestDatabase()

const repository: ImagesRepository = buildImageRepository(db)
const createImage = createFor(db, 'images')

beforeAll(async () => {
  await cleanDatabase(db)
  await createImage([{ url: 'url1' }, { url: 'url2' }, { url: 'url3' }])
})

afterAll(async () => {
  await cleanDatabase(db)
})

describe('ImagesRepository', () => {
  it('should retrieve all images', async () => {
    const images = await repository.getImages()
    expect(images).toHaveLength(3)
    expect(images).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: 'url1' }),
        expect.objectContaining({ url: 'url2' }),
        expect.objectContaining({ url: 'url3' }),
      ])
    )
  })

  it('should insert new images', async () => {
    const newImages = [{ url: 'url4' }, { url: 'url5' }]
    const insertedImages = await repository.insertImages(newImages)

    expect(insertedImages).toHaveLength(2)
    expect(insertedImages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: 'url4' }),
        expect.objectContaining({ url: 'url5' }),
      ])
    )

    const allImages = await repository.getImages()
    expect(allImages).toHaveLength(5)
  })

  it('should delete all images', async () => {
    const result = await repository.deleteImages()
    expect(result).toBeDefined()

    const images = await repository.getImages()
    expect(images).toHaveLength(0)
  })
})
