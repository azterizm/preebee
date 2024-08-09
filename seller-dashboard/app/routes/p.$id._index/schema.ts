import { z } from 'zod'

export const addReviewSchema = z.object({
  name: z.optional(z.string()),
  message: z.string().min(1),
  rating: z.string().optional(),
})
export interface CartItem {
  id: string
  quantity: number
  title: string
  price: number
  imageId: string
}
