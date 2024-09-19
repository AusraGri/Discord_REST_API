import { requestSchema, templateSchema } from './schema'

export const parseTemplateQuery = (message: unknown) =>
  requestSchema.parse(message)
export const parseTemplateText = (message: unknown) =>
  templateSchema.omit({ id: true }).parse(message)
export const parseTemplateUpdatable = (message: unknown) =>
  templateSchema.parse(message)