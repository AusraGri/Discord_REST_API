import saveImages from '../saveImages' // Adjust the path to your function

// Mock the Database type
type Database = any

// Mock the repository functions
const mockInsertImages = vi.fn()
const mockDeleteImages = vi.fn()

// Mock buildImagesRepository
vi.mock('../repository', () => ({
  default: vi.fn(() => ({
    insertImages: mockInsertImages,
    deleteImages: mockDeleteImages,
  })),
}))

describe('saveImages', () => {
  const db = {} as Database // A mock Database object

  afterEach(() => {
    // Clear mocks after each test
    vi.clearAllMocks()
  })

  test('should throw an error if no images are provided', async () => {
    // Arrange
    const images: any[] = []

    // Act & Assert
    await expect(saveImages(db, images)).rejects.toThrow('No images to save')
    expect(mockDeleteImages).toHaveBeenCalledTimes(1) // deleteImages should still be called
    expect(mockInsertImages).not.toHaveBeenCalled() // insertImages should not be called
  })

  test('should call deleteImages and insertImages with the provided images', async () => {
    // Arrange
    const images = [
      { id: 1, url: 'image1.png' },
      { id: 2, url: 'image2.png' },
    ]

    // Act
    const result = await saveImages(db, images)

    // Assert
    expect(mockDeleteImages).toHaveBeenCalledTimes(1) // deleteImages should be called once
    expect(mockInsertImages).toHaveBeenCalledTimes(1) // insertImages should be called once
    expect(mockInsertImages).toHaveBeenCalledWith(images) // Should be called with the passed images
    expect(result).toBe(true) // Should return true
  })

  test('should throw an error if deleteImages throws', async () => {
    // Arrange
    mockDeleteImages.mockRejectedValueOnce(new Error('Delete failed'))

    const images = [{ id: 1, url: 'image1.png' }]

    // Act & Assert
    await expect(saveImages(db, images)).rejects.toThrow('Delete failed')
    expect(mockDeleteImages).toHaveBeenCalledTimes(1) // deleteImages should be called
    expect(mockInsertImages).not.toHaveBeenCalled() // insertImages should not be called
  })
})
