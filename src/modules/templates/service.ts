import { Request} from 'express'
import buildTemplateRepository from './repository'
import type { TemplatesInsert, TemplatesSelect } from './repository'
import templateValidators from './validators'
import { Database } from '@/database'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'

export type DeleteTemplateResponse = {
  message: string
}

export interface TemplateService {
  getTemplates(req: Request): Promise<TemplatesSelect[]>
  postTemplates(req: Request): Promise<TemplatesSelect>
  patchTemplates(req: Request): Promise<TemplatesSelect>
  deleteTemplates(req: Request): Promise<DeleteTemplateResponse>
}

export const buildTemplateService = (db: Database): TemplateService => {
  const templatesRepository = buildTemplateRepository(db)
  const validate = templateValidators()

  const getTemplates = async (req: Request): Promise<TemplatesSelect[]> => {
    const userRequest = { ...req.query }
    const id = userRequest.id ? Number(userRequest.id) : undefined
    const limit = userRequest.limit ? Number(userRequest.limit) : undefined
    validate.parseTemplateQuery({ id, limit })

    const result: TemplatesSelect[] | [] =
      await templatesRepository.getTemplates({ id, limit })

    if (!result || result.length === 0) {
      throw new NotFound('No templates found')
    }

    return result
  }

  const postTemplates = async (req: Request): Promise<TemplatesSelect> => {
    const userRequest = { ...req.body }
    const { text } = userRequest

    validate.parseTemplateText({ text })

    const result: TemplatesSelect | undefined =
      await templatesRepository.insertTemplate({
        text,
      })

    if (!result) {
      throw new Error('Failed to insert template')
    }

    return result
  }

  const patchTemplates = async (req: Request): Promise<TemplatesSelect> => {
    const templateId = Number(req.params.id)

    const updatedTemplate: TemplatesInsert = { ...req.body }

    validate.parseTemplateText(updatedTemplate)
    validate.parseTemplateId({id: templateId})

    const templateExists = await templatesRepository.getTemplates({
      id: templateId,
    })

    if (!templateExists || templateExists.length === 0)
      throw new NotFound('No template found')

    const result: TemplatesSelect | undefined =
      await templatesRepository.patchTemplate({id: templateId, ...updatedTemplate})

    if (!result) throw new Error('Failed to update')

    return result
  }

  const deleteTemplates = async (
    req: Request
  ): Promise<DeleteTemplateResponse> => {
    const templateId = Number(req.params.id)

    validate.parseTemplateId({ id: templateId })

    const templateExists = await templatesRepository.getTemplates({
      id: templateId,
    })

    if (!templateExists || templateExists.length === 0)
      throw new BadRequest('Invalid template id')

    const result = await templatesRepository.deleteTemplate(templateId)

    if (!result.numDeletedRows) throw new Error('Failed to delete')

    return { message: 'Template deleted successfully' }
  }

  return { getTemplates, postTemplates, patchTemplates, deleteTemplates }
}
