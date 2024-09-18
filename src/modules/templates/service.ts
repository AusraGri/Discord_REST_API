import { requestSchema } from './schema'
import type { TemplatesRepository, TemplatesSelect } from './repository'

export const parseTemplateQuery = (message: unknown) =>
  requestSchema.safeParse(message)

export async function getRandomTemplate (
  db: TemplatesRepository
): Promise<string> {
  const allTemplates: TemplatesSelect[] | [] = await db.getTemplates()

  if (allTemplates.length < 1) throw new Error('No templates available')

  const randomIndex = Math.floor(Math.random() * allTemplates.length)

  return allTemplates[randomIndex].text
}
