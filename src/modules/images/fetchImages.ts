import { GiphyFetch } from '@giphy/js-fetch-api'
import Logger from '@/utils/errors/ErrorLogger'

export async function getGifs(apiKey: string) {


  if (!apiKey) {
    Logger.error('Giphy API key is not provided')
    process.exit(1)
  }

  const gf = new GiphyFetch(apiKey)

  const { data: gifs } = await gf.search('Well done celebration movie', {
    lang: 'en',
    limit: 25,
    type: 'gifs',
    rating: 'g',
  })

  const images = gifs.map((gif) => gif.images.downsized_medium.url)

  return images
  // return oneGif[0].images.original.url
  // return gifs[0].images.downsized_medium.url
}
