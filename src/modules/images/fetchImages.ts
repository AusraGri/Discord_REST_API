import { GiphyFetch } from '@giphy/js-fetch-api'
import Logger from '@/utils/errors/ErrorLogger'


export type Image = {
  url: string
}

export interface ImagesManager {
  getGifs: (keywords: string) => Promise<Image[]>
}

const buildImagesManager = (apiKey: string) : ImagesManager => ({
  getGifs: async (keywords: string) => {
    if (!apiKey) {
      Logger.error('Giphy API key is not provided');
      throw new Error('Giphy API key is not provided')
    }

    const gf = new GiphyFetch(apiKey)

    const { data: gifs } = await gf.search(`${keywords}`, {
      lang: 'en',
      limit: 25,
      type: 'gifs',
      rating: 'g',
    })

    const images: Image [] = gifs.map((gif) => ({url: gif.images.downsized_medium.url}))

    return images
  }
})

export default buildImagesManager