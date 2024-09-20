import { Request, Response, NextFunction } from 'express'
import buildTemplateRepository from './repository'
import type { TemplatesSelect } from './repository'
import templateValidators from './validators'
import { Database } from '@/database'
import ClientError from '@/errors/ClientError'

export interface TemplateService {
  getTemplates(req: Request, res: Response, next: NextFunction): Promise<void>
  postTemplates(req: Request, res: Response, next: NextFunction): Promise<void>
  patchTemplates(req: Request, res: Response, next: NextFunction): Promise<void>
  deleteTemplates(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>
}

export const buildTemplateService = (db: Database): TemplateService => {
  const templatesRepository = buildTemplateRepository(db)
  const validate = templateValidators()

  const getTemplates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userRequest = { ...req.query }
      const id = userRequest.id ? Number(userRequest.id) : undefined
      const limit = userRequest.limit ? Number(userRequest.limit) : undefined
      validate.parseTemplateQuery({ id, limit })

      const result = await templatesRepository.getTemplates({ id, limit })

      if (!result || result.length === 0) {
        throw new ClientError('No templates found')
      }

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  const postTemplates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
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

      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  const patchTemplates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const updatedTemplate = { ...req.body }

      validate.parseTemplateUpdatable(updatedTemplate)

      const templateExists = await templatesRepository.getTemplates({
        id: updatedTemplate.id,
      })

      if (!templateExists || templateExists.length === 0)
        throw new ClientError('Invalid template id')

      const result: TemplatesSelect | undefined =
        await templatesRepository.patchTemplate(updatedTemplate)

      if (!result) throw new Error('Failed to update')

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
  const deleteTemplates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const templateId = Number(req.params.id)

      validate.parseTemplateId({ id: templateId })

      const templateExists = await templatesRepository.getTemplates({
        id: templateId,
      })

      if (!templateExists || templateExists.length === 0)
        throw new ClientError('Invalid template id')

      const result = await templatesRepository.deleteTemplate(templateId)

      if (!result.numDeletedRows) throw new Error('Failed to delete')

      res.status(200).json({ message: 'Template deleted successfully' })
    } catch (error) {
      next(error)
    }
  }

  return { getTemplates, postTemplates, patchTemplates, deleteTemplates }
}
