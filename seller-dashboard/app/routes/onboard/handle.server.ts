import { redis } from '~/db.server'

export async function getOnboardData(userId: string) {
  const name = await redis.get(`onboard:${userId}:name`)
  const customize = await redis.get(`onboard:${userId}:customize`)
  return {
    name,
    customize,
  }
}

export async function resetOnboardData(userId: string) {
  const name = await redis.get(`onboard:${userId}:name`)
  if (name) await redis.del(`lock_shop_name:${name}`)
  await redis.del(`onboard:${userId}:name`)
  await redis.del(`onboard:${userId}:customize`)
}
