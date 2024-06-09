import { z } from 'zod'

export const userSchemaCreate = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(3).max(50),
  email: z.string().email(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
