import { z } from 'zod'

const requestSchema = z.object({
  id: z
    .number({
      invalid_type_error: 'id must be a number',
    })
    .optional(),
  limit: z
    .number({
      invalid_type_error: 'Limit must be a number',
    })
    .min(1, { message: 'Must be 1 or more' })
    .optional(),
})

export { requestSchema }
