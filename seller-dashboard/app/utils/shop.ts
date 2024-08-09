import { prisma } from '~/db.server'

export async function isShopBanned(shopName: string) {
  const isBanned = await prisma.shop.count({
    where: { name: shopName, active: false }
  })
  return Boolean(isBanned)
}
