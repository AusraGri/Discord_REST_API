import { Mock } from 'vitest'
import fetchAndStoreImages from '../index'
import saveImages from '../saveImages'
import { KEYWORDS } from '@/config/config'
import { ImagesManager } from '../fetchImages'

vi.mock('../saveImages')

type Database = any
const mockDb: Database = {}

const mockImagesManager: ImagesManager = {
  getGifs: vi.fn(),
}

describe('fetchAndStoreImages', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should fetch and save images successfully', async () => {
    const mockImages = [{ url: 'image1.gif' }, { url: 'image2.gif' }]
    const mockedGetGifs = mockImagesManager.getGifs as unknown as Mock

    mockedGetGifs.mockResolvedValue(mockImages)

    const mockedSaveImages = saveImages as Mock

    mockedSaveImages.mockResolvedValue(true)

    await expect(
      fetchAndStoreImages(mockDb, mockImagesManager)
    ).resolves.not.toThrow()

    expect(mockImagesManager.getGifs).toHaveBeenCalledWith(KEYWORDS)

    expect(mockedSaveImages).toHaveBeenCalledWith(mockDb, mockImages)
  })

  test('should throw an error if no images are fetched', async () => {
    const mockedGetGifs = mockImagesManager.getGifs as unknown as Mock
    mockedGetGifs.mockResolvedValue([])

    await expect(
      fetchAndStoreImages(mockDb, mockImagesManager)
    ).rejects.toThrow('Failed to fetch images')

    expect(mockImagesManager.getGifs).toHaveBeenCalledWith(KEYWORDS)
    expect(saveImages).not.toHaveBeenCalled()
  })

  test('should throw an error if saving images fails', async () => {
    const mockImages = [{ url: 'image1.gif' }, { url: 'image2.gif' }]
    const mockedGetGifs = mockImagesManager.getGifs as unknown as Mock

    mockedGetGifs.mockResolvedValue(mockImages)

    const mockedSaveImages = saveImages as Mock
    mockedSaveImages.mockResolvedValue(false)

    await expect(
      fetchAndStoreImages(mockDb, mockImagesManager)
    ).rejects.toThrow('failed to save images')

    expect(mockImagesManager.getGifs).toHaveBeenCalledWith(KEYWORDS)
    expect(mockedSaveImages).toHaveBeenCalledWith(mockDb, mockImages)
  })

  test('should handle unknown errors', async () => {
    const mockedGetGifs = mockImagesManager.getGifs as unknown as Mock

    mockedGetGifs.mockRejectedValue(new Error('API error'))

    await expect(
      fetchAndStoreImages(mockDb, mockImagesManager)
    ).rejects.toThrow('API error')

    expect(mockImagesManager.getGifs).toHaveBeenCalledWith(KEYWORDS)
    expect(saveImages).not.toHaveBeenCalled()
  })
})
