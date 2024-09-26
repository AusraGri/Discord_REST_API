import { Database } from '@/database'
import buildTemplatesRepository, {
  TemplatesSelect,
} from '@/modules/templates/repository'

export default async function getRandomTemplate(db: Database): Promise<TemplatesSelect> {
  const templatesRepository = buildTemplatesRepository(db)
  const allTemplates: TemplatesSelect[] | [] =
    await templatesRepository.getTemplates()

  if (allTemplates.length < 1) throw new Error('No templates available')

  const randomIndex = Math.floor(Math.random() * allTemplates.length)

  return allTemplates[randomIndex]
}
