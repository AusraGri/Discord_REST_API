import { requestSchema, payloadSchema } from './schema'

export const validatePostMessageRequest = (message: unknown) =>
  payloadSchema.parse(message)
export const validateGetMessagesRequest = (message: unknown) =>
  requestSchema.parse(message)
