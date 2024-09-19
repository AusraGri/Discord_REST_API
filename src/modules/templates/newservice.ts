import { Request, Response, NextFunction } from 'express'
import buildTemplateRepository from './repository'
import type { TemplatesSelect } from './repository'
import {
  parseTemplateQuery,
  parseTemplateText,
  parseTemplateUpdatable,
} from './validators'
import { Database } from '@/database'
import ClientError from '@/errors/ClientError'

export const buildTemplateService = (db: Database) => {
  const templatesRepository = buildTemplateRepository(db)

  const getTemplates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userRequest = { ...req.query }
      const id = userRequest.id ? Number(userRequest.id) : undefined
      const limit = userRequest.limit ? Number(userRequest.limit) : undefined
      parseTemplateQuery({ id, limit })

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

      parseTemplateText({ text })

      const result: TemplatesSelect | undefined = await templatesRepository.insertTemplate({
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

      parseTemplateUpdatable(updatedTemplate)

      const templateExists = await templatesRepository.getTemplates({id: updatedTemplate.id})

      if(!templateExists) throw new ClientError('Invalid template id')

      const result: TemplatesSelect | undefined =
        await templatesRepository.patchTemplate(updatedTemplate)

      if(!result) throw new Error('Failed to update')

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  return { getTemplates, postTemplates, patchTemplates }
}
