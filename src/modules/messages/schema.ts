import { z } from 'zod'

// define what is the expected shape of the data
const requestSchema = z.object({
  username: z
    .string({
      required_error: 'Username is required',
      invalid_type_error: 'Username must be a string',
    })
    .trim()
    .min(3, { message: 'Must be 3 or more characters long' })
    .max(100, { message: 'Must be 100 or fewer characters long' }),
  sprint: z
    .string()
    .trim()
    .min(3, { message: 'Must be 3 or more characters long' }),
})

export default requestSchema