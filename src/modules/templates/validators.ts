import { requestSchema, templateSchema } from './schema'

const templateValidators = () => {
  const parseTemplateQuery = (message: unknown) => requestSchema.parse(message)

  const parseTemplateText = (message: unknown) =>
    templateSchema.omit({ id: true }).parse(message)

  const parseTemplateUpdatable = (message: unknown) =>
    templateSchema.parse(message)

  const parseTemplateId = (message: unknown) =>
    templateSchema.omit({ text: true }).parse(message)

  return {
    parseTemplateId,
    parseTemplateQuery,
    parseTemplateUpdatable,
    parseTemplateText,
  }
}

export default templateValidators
