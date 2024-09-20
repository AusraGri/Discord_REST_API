import { z } from 'zod'

export const sprintSchema = z.object({
  sprintCode: z
    .string({
      invalid_type_error: 'Sprint code must be a string',
    })
    .trim(),
  fullTitle: z
    .string({
      invalid_type_error: 'Full sprint title must be a string',
    })
    .trim()
    .min(5, { message: 'Must be 5 or more' })
})