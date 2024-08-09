import { prisma } from '~/db.server'
import { cartCookie } from './cookies.server'

export async function getCart(request: Request) {
  const cookie = request.headers.get('Cookie')
  const cartData = await cartCookie.parse(cookie)
  const cart = !cartData ? [] : await prisma.product.findMany({
    where: { id: { in: Object.keys(cartData) } },
    select: {
      id: true,
      title: true,
      price: true,
      images: { select: { id: true }, take: 1, orderBy: { createdAt: 'desc' } },
    },
  }).then((r) =>
    r.map((p) => ({
      ...p,
      quantity: cartData[p.id] as number,
    }))
  )
  return cart
}
