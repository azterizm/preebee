import z from 'zod'

export const submitSchema = z.object({
  address: z.string(),
  phone: z.string()
})
