import { createCookie } from '@remix-run/node'

export const cartCookie = createCookie('cart', {
  maxAge: 604_800, // one week
})
export const checkoutCookie = createCookie('checkout', {
  maxAge: 604_800, // one week
})
