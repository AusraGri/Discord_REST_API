export default function getRandomImageUrl(images: string[]) {
  if (!images || images.length < 1) throw new Error('No templates available')

  const randomIndex = Math.floor(Math.random() * images.length)

  return images[randomIndex]
}
