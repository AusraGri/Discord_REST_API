import buildImagesManager, { Image } from '../fetchImages'
import Logger from '@/utils/errors/ErrorLogger'

vi.mock('@giphy/js-fetch-api', () => ({
  GiphyFetch: vi.fn(() => ({
    search: vi.fn().mockResolvedValue({
      data: [
        {
          images: {
            downsized_medium: {
              url: 'https://example.com/gif1.gif',
            },
          },
        },
        {
          images: {
            downsized_medium: {
              url: 'https://example.com/gif2.gif',
            },
          },
        },
      ],
    }),
  })),
}))

vi.mock('@/utils/errors/ErrorLogger', () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('ImagesManager', () => {
  const apiKey = 'test_api_key'
  const imagesManager = buildImagesManager(apiKey)

  test('should return gifs for valid keywords', async () => {
    const keywords = 'funny cat'
    const gifs: Image[] = await imagesManager.getGifs(keywords)

    expect(gifs).toHaveLength(2)
    expect(gifs[0].url).toBe('https://example.com/gif1.gif')
    expect(gifs[1].url).toBe('https://example.com/gif2.gif')
  })

  test('should log an error and throw if no API key is provided', async () => {
    const imagesManagerWithoutApiKey = buildImagesManager('')

    await expect(imagesManagerWithoutApiKey.getGifs('test')).rejects.toThrow(
      'Giphy API key is not provided'
    )

    expect(Logger.error).toHaveBeenCalledWith('Giphy API key is not provided')
  })
})
