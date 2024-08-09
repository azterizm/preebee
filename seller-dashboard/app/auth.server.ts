import { Seller } from '@prisma/client'
import _ from 'lodash'
import { Authenticator } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import { GoogleStrategy } from 'remix-auth-google'
import { prisma, redis } from './db.server'
import { sessionStorage } from './session.server'
import { AuthUser } from './types/auth'
import { validatePassword } from './utils/auth'

export let authenticator = new Authenticator<AuthUser>(sessionStorage)

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
  async ({ accessToken, refreshToken, profile }) => {
    let user = await prisma.seller.findFirst({
      where: {
        providerId: profile.id,
      },
    }).catch(_ => undefined)

    if (!user) {
      user = await prisma.seller.create({
        data: {
          providerId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0].value,
          avatarURL: profile.photos?.[0].value,
          accessToken,
          refreshToken,
          providerName: 'google',
        },
      })
    }


    return sanitizeUser(user)
  },
)

const formStrategy = new FormStrategy(
  async ({ form, context }) => {
    const ip = context?.ip
    const email = form.get('email')?.toString()
    const password = form.get('password')?.toString()

    if (!ip || !email || !password) {
      throw new Error('Invalid request')
    }

    const tries = await redis.get(`login-tries:${ip}`)

    if (tries && parseInt(tries) > 5) {
      throw new Error('Too many login attempts')
    }

    await redis.setex(
      `login-tries:${ip}`,
      60 * 15,
      (parseInt(tries || '0') || 0) + 1,
    )

    const user = await prisma.seller.findFirst({
      where: {
        email,
        providerName: 'form'
      },
    })

    if (!user || !user.passwordHash || !user.passwordSalt) {
      throw new Error('Invalid email or password')
    }

    const passwordMatches = validatePassword(
      password,
      user.passwordHash,
      user.passwordSalt,
    )

    if (!passwordMatches) {
      throw new Error('Invalid email or password')
    }

    return sanitizeUser(user)
  },
)

async function sanitizeUser(user: Seller) {
  const shop = await prisma.shop.findFirst({
    where: {
      seller: { id: user.id },
    },
    select: {
      id: true,
      name: true,
    },
  })
  return {
    ..._.pick(user, ['id', 'name', 'email', 'avatarURL']),
    shop,
  }
}

authenticator.use(googleStrategy, 'google')
authenticator.use(formStrategy, 'form')
