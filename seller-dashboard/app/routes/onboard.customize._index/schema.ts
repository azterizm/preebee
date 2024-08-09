import z from 'zod'
export const submitSchema = z.object({
  name: z.string().min(3).max(50),
  color: z.string().transform((e) => e.split('bg-')[1].split('-200')[0]),
  layout: z.union([z.string(), z.number()]).transform((e) => Number(e)),
  description: z.optional(z.string()),
  logoUrl: z.union([
    z.string().length(0, 'Please enter correct image url.'),
    z.string().min(4),
  ]).optional(),
  socialMedia: z.optional(
    z.array(z.object({
      name: z.string(),
      url: z.union([
        z.string().length(0, 'Please enter correct social media url.'),
        z.string().min(4),
      ]).optional()
        .transform(
          (e) => e === '' ? undefined : e,
        ),
    })).transform((e) => e.filter((v) => v.url)),
  ),
  phone: z.union([
    z.string().length(0, 'Please enter correct mobile phone number.'),
    z.string().min(10).max(15),
  ])
    .optional()
    .transform((e) => e === '' ? undefined : e),
})

export const customizeSchema = z.object({
  name: z.string(),
  color: z.string(),
  layout: z.number(),
  socialMedia: z.array(z.object({ name: z.string(), url: z.string() })),
  phone: z.string().nullish(),
  logoFileName: z.string().nullish(),
  id: z.string(),
  description: z.optional(z.string()),
})
