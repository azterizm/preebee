import { z } from 'zod'

export const schema = z.object({
  name: z.string().min(3),
  phone: z.string().length(11),
  address: z.string().min(10),
  province: z.string().min(2),
  city: z.string().min(2),
  save: z.string().optional().transform((v) => v === 'on'),
})
