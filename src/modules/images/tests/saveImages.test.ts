import saveImages from '../saveImages'

type Database = any

const mockInsertImages = vi.fn()
const mockDeleteImages = vi.fn()

vi.mock('../repository', () => ({
  default: vi.fn(() => ({
    insertImages: mockInsertImages,
    deleteImages: mockDeleteImages,
  })),
}))

describe('saveImages', () => {
  const db = {} as Database

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should throw an error if no images are provided', async () => {
    const images: any[] = []

    await expect(saveImages(db, images)).rejects.toThrow('No images to save')
    expect(mockDeleteImages).toHaveBeenCalledTimes(1)
    expect(mockInsertImages).not.toHaveBeenCalled()
  })

  test('should call deleteImages and insertImages with the provided images', async () => {
    const images = [
      { id: 1, url: 'image1.png' },
      { id: 2, url: 'image2.png' },
    ]

    const result = await saveImages(db, images)

    expect(mockDeleteImages).toHaveBeenCalledTimes(1)
    expect(mockInsertImages).toHaveBeenCalledTimes(1)
    expect(mockInsertImages).toHaveBeenCalledWith(images)
    expect(result).toBe(true)
  })

  test('should throw an error if deleteImages throws', async () => {
    mockDeleteImages.mockRejectedValueOnce(new Error('Delete failed'))

    const images = [{ id: 1, url: 'image1.png' }]

    await expect(saveImages(db, images)).rejects.toThrow('Delete failed')
    expect(mockDeleteImages).toHaveBeenCalledTimes(1)
    expect(mockInsertImages).not.toHaveBeenCalled()
  })
})
