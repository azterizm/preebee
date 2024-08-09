import { prisma, redis } from "~/db.server";

export async function isNameUsed(name: string): Promise<boolean> {
  const db = await prisma.shop.count({
    where: {
      name,
    },
  })

  const locked = await redis.get(`lock_shop_name:${name}`)

  return Boolean(db) || Boolean(locked)
}
