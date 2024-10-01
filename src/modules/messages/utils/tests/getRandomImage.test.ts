import getRandomImageUrl from '../getRandomImageUrl'
import { Image } from '@/modules/images/fetchImages'

describe('getRandomImageUrl', () => {
  test('should throw an error if images array is empty or undefined', () => {
    expect(() => getRandomImageUrl([])).toThrow('No templates available')

    expect(() => getRandomImageUrl(undefined as unknown as Image[])).toThrow(
      'No templates available'
    )
  })

  test('should return a valid image URL from the images array', () => {
    const images: Image[] = [
      { url: 'https://example.com/image1.jpg' },
      { url: 'https://example.com/image2.jpg' },
      { url: 'https://example.com/image3.jpg' },
    ]

    const result = getRandomImageUrl(images)

    expect(images.map((image) => image.url)).toContain(result)
  })

  test('should return the only image URL when there is one image in the array', () => {
    const images: Image[] = [{ url: 'https://example.com/image1.jpg' }]

    const result = getRandomImageUrl(images)

    expect(result).toBe('https://example.com/image1.jpg')
  })

  test('should return a random URL from a non-empty images array', () => {
    const images: Image[] = [
      { url: 'https://example.com/image1.jpg' },
      { url: 'https://example.com/image2.jpg' },
      { url: 'https://example.com/image3.jpg' },
    ]

    const mockMathRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = getRandomImageUrl(images)

    expect(result).toBe('https://example.com/image2.jpg')

    mockMathRandom.mockRestore()
  })
})
