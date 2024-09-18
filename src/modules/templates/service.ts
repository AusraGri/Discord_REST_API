import { requestSchema } from "./schema";

export const parseTemplateQuery = (message: unknown) => requestSchema.safeParse(message)