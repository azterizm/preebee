import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import _ from 'lodash'
import { useState } from 'react'
import Logo from '~/components/Logo'
import PhoneNumberInput from '~/components/PhoneNumberInput'
import geo from '~/constants/geo.json'
import { prisma } from '~/db.server'
import { commitSession, getSession } from '~/session.server'
import { generateIdForModel, getClientIPAddress } from '~/utils/api'
import { formatNumber } from '~/utils/ui'
import { getCart } from '../p.$id._index/cart.server'
import {
  cartCookie,
  checkoutCookie,
} from '../p.$id._index/cookies.server'
import { schema } from './schema'
import { separateCartItemsByShop } from './util'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cart = await getCart(request)
  if (!cart.length) {
    return redirect('/')
  }
  const cartTotal = cart.reduce((acc, r) => acc + r.price * r.quantity, 0)
  const shops = await Promise.all(
    cart.map((r) => r.id).map((r) =>
      prisma.shop.findFirst({
        where: {
          products: {
            some: {
              id: r,
            },
          },
        },
        select: {
          id: true,
          title: true,
          name: true,
          shippingFee: true,
        },
      })
    ),
  ).then((r) => _.uniqBy(r, 'id'))
  const shippingTotal = shops.reduce(
    (acc, r) => acc + (r?.shippingFee || 0),
    0,
  )

  return json({ cart, shops, cartTotal, shippingTotal })
}

export default function Checkout() {
  const data = useLoaderData<typeof loader>()
  const [phone, setPhone] = useState('')
  const fetcher = useFetcher<{ error?: string }>()

  return (
    <div className='container mx-auto py-4'>
      <Logo />
      <p className='text-5xl font-bold'>Checkout</p>
      <div className='flex flex-col-reverse xl:grid grid-cols-2 gap-4 my-8'>
        <fetcher.Form method='post' className='space-y-4'>
          <div className='form-control'>
            <label htmlFor='name' className='label'>
              <span className='label-text'>Name</span>
            </label>
            <input
              minLength={3}
              required
              name='name'
              type='text'
              className='input input-bordered'
            />
          </div>
          <PhoneNumberInput
            required
            inputClassName='input-bordered'
            value={phone}
            onChange={setPhone}
          />
          <div className='form-control'>
            <label htmlFor='name' className='label'>
              <span className='label-text'>Address</span>
            </label>
            <textarea
              name='address'
              className='textarea textarea-bordered'
              required
              minLength={10}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='form-control '>
              <label htmlFor='name' className='label'>
                <span className='label-text'>Province</span>
              </label>
              <select
                name='province'
                id='province'
                className='select select-bordered'
                required
                defaultValue='Sindh'
              >
                {geo.provinces.map((r) => <option key={r} value={r}>{r}
                </option>)}
              </select>
            </div>
            <div className='form-control'>
              <label htmlFor='name' className='label'>
                <span className='label-text'>City</span>
              </label>
              <input
                required
                minLength={2}
                name='city'
                type='text'
                className='input input-bordered'
              />
            </div>
          </div>
          <div className='form-control w-max'>
            <label htmlFor='name' className='label gap-2'>
              <input
                name='save'
                type='checkbox'
                className='checkbox checkbox-primary'
              />
              <span className='label-text'>
                Save this information for next time.
              </span>
            </label>
          </div>

          <div className='collapse collapse-arrow bg-base-200'>
            <input type='checkbox' name='my-accordion-2' />
            <div className='collapse-title text-xl font-medium'>
              <b>Payment Method:</b> Cash on Delivery
            </div>
            <div className='collapse-content'>
              <p>
                You will pay each shop's delivery person separately when you
                receive your order.
              </p>
            </div>
          </div>

          <button className='btn btn-primary w-full !mt-6'>Place Order</button>
          {fetcher.state === 'idle' && fetcher.data?.error ? (
            <p className="text-lg text-error">{fetcher.data.error}</p>
          ) : null}
        </fetcher.Form>
        <div className='bg-base-200 h-max p-4 rounded-lg xl:sticky top-4 left-0'>
          <p className='font-medium text-xl'>Your cart items:</p>

          <div>
            {data.cart.map((r) => (
              <div key={r.id} className='py-4 relative'>
                <div className='flex items-start gap-4'>
                  <img
                    src={`/api/product_image/${r.images[0].id}`}
                    alt='product image'
                    className='w-16 rounded-lg'
                  />

                  <p>{r.title}</p>
                </div>
                <div className='flex items-center justify-between mt-2 text-sm'>
                  <p>Quantity: {r.quantity}</p>
                  <p>Rs. {formatNumber(r.price)}</p>
                </div>
              </div>
            ))}
            <div className='bg-black h-0.5 w-full' />
            <div className='flex items-center justify-between mt-2'>
              <p>Item{data.cart.length > 1 ? 's' : ''}</p>
              <p>{data.cart.length}</p>
            </div>
            <div className='flex items-center justify-between mt-2'>
              <p>Subtotal</p>
              <p>Rs. {formatNumber(data.cartTotal)}</p>
            </div>
            <div className='flex items-start justify-between mt-2'>
              <p>Shipping</p>
              <p className='text-right'>
                {data.shops.map((r) => (
                  <Link
                    key={r?.id}
                    className='text-sm hover:text-blue-600'
                    to={`https://${r?.name}.preebee.com`}
                    target='_blank'
                  >
                    <b className='font-semibold'>{r?.title}</b>: Rs.{' '}
                    {formatNumber(r?.shippingFee || 0)}
                    <br />
                  </Link>
                ))}
                <span>
                  <b className='font-semibold'>Total Shipping Cost:</b>{' '}
                  {formatNumber(
                    data.shippingTotal,
                  )}
                </span>
              </p>
            </div>
            <div className='bg-black h-0.5 my-4 w-full' />
            <div className='flex items-start justify-between mt-2 text-lg font-semibold'>
              <p>Total</p>
              <p>
                Rs. {formatNumber(
                  data.cartTotal +
                  data.shippingTotal,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

//when certain item does not stock at the time of checkout
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const parse = schema.safeParse(Object.fromEntries(formData))
  const ip = getClientIPAddress(request)
  if (!ip) {
    return json({
      error: 'Invalid device. Please continue from another device.',
    }, { status: 500 })
  }

  if (!parse.success) {
    return json({
      error: `There is error in the input. ${JSON.stringify(parse.error.errors[0].path[0])} ${parse.error.errors[0].message}`
    })
  }

  const { data } = parse
  const cart = await getCart(request)
  if (!cart.length) {
    return json({
      error:
        'Cart is empty. Please add some items to cart before placing an order.',
    }, { status: 400 })
  }
  const cartTotal = cart.reduce((acc, r) => acc + r.price * r.quantity, 0)
  if (cartTotal < 50) {
    return json({
      error: 'Cart total is less than Rs. 50. Please add more items.',
    }, { status: 400 })
  }

  const cartWithShopId = await Promise.all(
    cart.map((r) => r.id).map(async (r) => ({
      cartProductId: r,
      ...await prisma.shop.findFirst({
        where: {
          products: {
            some: {
              id: r,
            },
          },
        },
        select: {
          id: true,
          shippingFee: true
        },
      }),
    })),
  ).then(r => separateCartItemsByShop(r))


  const [deliveryInfo, invoice] = await Promise.all([
    prisma.deliveryInfo.create({
      data: {
        ip,
        city: data.city,
        province: data.province,
        address: data.address,
        phone: data.phone,
        name: data.name,
      },
    }),
    prisma.invoice.create({
      data: {
        id: await generateIdForModel(data.name, prisma.invoice),
        password: data.phone,
      },
    }),
  ])

  await Promise.all(cartWithShopId.map(async (r) => {
    const cartItems = cart.filter(v => r.productIds.includes(v.id))

    await prisma.order.create({
      data: {
        deliveryInfoId: deliveryInfo.id,
        shopId: r.shopId,
        items: {
          create: cartItems.map((p) => ({
            productId: p.id,
            quantity: p.quantity,
            price: p.price,
          })),
        },
        total: cartItems.reduce((acc, p) => acc + p.price * p.quantity, 0) +
          (r?.shippingFee || 0),
        invoiceId: invoice.id,
        shippingFee: r.shippingFee
      },
    })

    for (let i = 0; i < cartItems.length; i++) {
      const { id, quantity } = cartItems[i];
      await prisma.product.update({
        where: { id: id },
        data: { stockAvailable: { decrement: quantity } }
      })
    }
  }))

  const session = await getSession(request.headers.get('Cookie'))
  session.set(`invoice_password:${invoice.id}`, data.phone)

  const headers: HeadersInit = [
    ['Set-Cookie', await commitSession(session)],
    ['Set-Cookie', await cartCookie.serialize({})],
    ['Set-Cookie', `message=place_order; Path=/; HttpOnly; Max-Age=5`],
  ]

  if (data.save) headers.push(['Set-Cookie', await checkoutCookie.serialize(data)])

  return redirect('/invoice/' + invoice.id, { headers, })
}
