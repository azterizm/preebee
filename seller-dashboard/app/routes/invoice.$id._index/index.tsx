import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { ClientOnly } from 'remix-utils/client-only'
import Logo from '~/components/Logo'
import PhoneNumberInput from '~/components/PhoneNumberInput'
import { commitSession, getSession } from '~/session.server'
import { formatNumber } from '~/utils/ui'
import { getInvoice } from './api.server'
import RenderStatusTableData from './RenderStatusTableData'
import ShareDialog from './ShareDialog'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const id = params.id

  const session = await getSession(request.headers.get('Cookie'))
  const passwordInput = session.get(`invoice_password:${id}`) as string
  const cookie = request.headers.get('Cookie')
  const recentlyPlacedOrder = Boolean(cookie?.includes('message=place_order'))
  const otherInfo = {
    recentlyPlacedOrder,
    inputAvailable: Boolean(passwordInput),
    phoneNumber: recentlyPlacedOrder ? passwordInput : '',
  }

  if (!id) {
    return json({
      orders: [],
      message: 'Invoice not available.',
      ...otherInfo,
    })
  }

  const instance = await getInvoice(id)
  if (!instance) {
    return json({
      orders: [],
      message: 'Invoice not available.',
      ...otherInfo,
    })
  }

  const isCorrectPassword = !passwordInput
    ? false
    : instance.password === passwordInput

  if (!isCorrectPassword) {
    session.unset(`invoice_password:${id}`)
    return json({
      orders: [],
      message: 'Password is incorrect',
      ...otherInfo,
    }, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    })
  }

  return json({
    orders: instance.orders,
    message: null,
    ...otherInfo,
  }, {
    headers: [
      ['Set-Cookie', await commitSession(session)],
    ].concat(
      recentlyPlacedOrder
        ? [['Set-Cookie', 'message=; Path=/; Max-Age=0']]
        : [],
    ) as any,
  })
}
export default function Invoice() {
  const data = useLoaderData<typeof loader>()
  const [phoneNumber, setPhoneNumber] = useState('' as string)
  const fetcher = useFetcher()

  useEffect(() => {
    if (data.orders.length && data.recentlyPlacedOrder) {
      setTimeout(() => {
        ; (document as any).getElementById('share_modal')?.showModal()
      }, 500)
    }
  }, [])

  if (!data.orders.length) {
    return (
      <div className='container mx-auto py-4'>
        <Logo />
        <p className='text-5xl font-bold'>Invoice</p>
        {data.message?.includes('Password') && !data.inputAvailable
          ? null
          : (
            <p className='text-lg text-center my-8 text-error'>
              {data.message || 'No orders.'}
            </p>
          )}
        {data.message?.includes('Password')
          ? (
            <fetcher.Form method='post' className='mt-8'>
              <p>Please add your phone number to view this invoice.</p>
              <PhoneNumberInput
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e)}
                name='phone_number'
                required
                label='Phone Number'
                inputClassName='input input-bordered'
              />
              <button className='mt-8 btn btn-primary'>Submit</button>
            </fetcher.Form>
          )
          : null}
      </div>
    )
  }

  return (
    <div className='container mx-auto py-4'>
      <Logo />
      <p className='text-5xl font-bold'>Invoice</p>
      <div className='overflow-x-auto my-8'>
        <table className='table'>
          <thead>
            <tr>
              <th>Shop</th>
              <th>Status</th>
              <th>Shipping Fees</th>
              <th>Total</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map((r) =>
              !r ? null : (
                <tr key={r.id}>
                  <td>
                    <Link
                      to={`https://${r.shop.name}.preebee.com/`}
                      target='_blank'
                      className='link link-primary'
                    >
                      {r.shop.title}
                    </Link>
                  </td>
                  <RenderStatusTableData message={r.message} status={r.status} />
                  <td>Rs. {formatNumber(r.shippingFee)}</td>
                  <td>Rs. {formatNumber(r.total)}</td>
                  <td>
                    <div className='flex items-center gap-2 flex-wrap'>
                      {r.items.map((r) => (
                        <div
                          key={r.id}
                          className='py-4 relative min-w-56 bg-base-200 p-4 rounded-lg'
                        >
                          <div className='flex items-start gap-4'>
                            <img
                              src={`/api/product_image/${r.product.images[0].id
                                }`}
                              alt='product image'
                              className='w-16 rounded-lg'
                            />

                            <p>{r.product.title}</p>
                          </div>
                          <div className='flex items-center justify-between mt-2 text-sm'>
                            <p>Quantity: {r.quantity}</p>
                            <p>Rs. {formatNumber(r.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      <ClientOnly>
        {() => <ShareDialog phoneNumber={data.phoneNumber} />}
      </ClientOnly>
    </div>
  )
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const phoneNumber = formData.get('phone_number') as string
  const session = await getSession(request.headers.get('Cookie'))
  session.set(`invoice_password:${params.id}`, phoneNumber)
  return json({ message: null }, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  })
}
