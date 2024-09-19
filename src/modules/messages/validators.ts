import { requestSchema, payloadSchema } from "./schema"


export const validatePostMessageRequest = (message: unknown) => payloadSchema.safeParse(message)
export const validateGetMessagesRequest = (message: unknown) => requestSchema.safeParse(message)