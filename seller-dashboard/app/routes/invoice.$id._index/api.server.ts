import { prisma } from '~/db.server'

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    select: {
      id: true,
      password: true,
      orders: {
        select: {
          id: true,
          shop: {
            select: { id: true, name: true, title: true, shippingFee: true },
          },
          total: true,
          shippingFee:true,
          status: true,
          message:true,
          items: {
            select: {
              id: true,
              product: {
                select: {
                  title: true,
                  id: true,
                  images: {
                    select: {
                      id: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                  },
                },
              },
              price: true,
              quantity: true,
            },
          },
        },
      },
    },
  })
}
