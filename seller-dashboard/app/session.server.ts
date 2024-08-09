import { createCookieSessionStorage, redirect } from '@remix-run/node'
import { AuthUser } from './types/auth'

// export the whole sessionStorage object
export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session', // use any name you want here
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [process.env.COOKIE_SECRET], // replace this with an actual secret
    secure: process.env.NODE_ENV === 'production', // enable this in prod only
    domain: process.env.NODE_ENV === 'production' ? 'preebee.com' : undefined
  },
})

export async function requireSellerWithShop(request: Request) {
  let session = await getSession(request.headers.get('Cookie'))
  let user = session.get('user') as AuthUser
  if (!user?.shop) throw await logout(request)
  return user as AuthUser & { shop: NonNullable<AuthUser['shop']> }
}

export async function requireSeller(request: Request) {
  let session = await getSession(request.headers.get('Cookie'))
  if (!session.get('user')) throw await logout(request)
  return session.get('user') as AuthUser
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get('Cookie'))
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  })
}

// you can also export the methods individually for your own usage
export let { getSession, commitSession, destroySession } = sessionStorage
