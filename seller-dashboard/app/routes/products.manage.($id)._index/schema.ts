import z from 'zod'
export const submitSchema = z.object({
  title: z.string().min(1),
  price: z.coerce.number(z.string().transform((v) => parseInt(v, 10))).min(
    10,
  ).max(200000),
  description: z.optional(z.string()),
  stock: z.coerce.number(z.string().transform((v) => parseInt(v, 10))).min(
    0,
  ).max(1000),
  categories: z.array(z.string()),
})
