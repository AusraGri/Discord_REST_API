import { z } from 'zod'

const requestSchema = z.object({
  username: z
    .string({
      invalid_type_error: 'Username must be a string',
    })
    .trim()
    .min(3, { message: 'Must be 3 or more characters long' })
    .max(100, { message: 'Must be 100 or fewer characters long' })
    .optional(),
  sprint: z
  .string({
    invalid_type_error: 'Sprint must be a string',
  })
  .trim()
  .min(3, { message: 'Must be 3 or more characters long' })
  .optional(),
  limit: z
  .number({
    invalid_type_error: 'Limit must be a number',
  })
  .positive()
  .optional(),
})

const payloadSchema = z.object({
  username: z
    .string({
      invalid_type_error: 'Username must be a string',
    })
    .trim()
    .min(3, { message: 'Must be 3 or more characters long' })
    .max(100, { message: 'Must be 100 or fewer characters long' }),
  sprintCode: z
  .string({
    invalid_type_error: 'Sprint code must be a string',
  })
  .trim()
  .min(3, { message: 'Must be 3 or more characters long' }),
})

export {requestSchema, payloadSchema}
