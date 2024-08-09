import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import classNames from 'classnames'
import moment from 'moment'
import { serialize } from 'object-to-formdata'
import { useRef, useState } from 'react'
import { ArrowLeft } from 'react-feather'
import invariant from 'tiny-invariant'
import Logo from '~/components/Logo'
import { prisma } from '~/db.server'
import { requireSellerWithShop } from '~/session.server'
import { OrderStatus, orderStatuses } from '~/types/db'
import { convertFormToJSON } from '~/utils/api'
import { formatNumber } from '~/utils/ui'
import { getStatusLabel, getTextColorClassNameByStatus } from './invoice.$id._index/RenderStatusTableData'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const id = params.id
  invariant(typeof id === 'string', 'ID not found')
  const user = await requireSellerWithShop(request)
  const order = await prisma.order.findFirst({
    where: { id, shopId: user.shop.id },
    select: {
      id: true,
      checked: true,
      total: true,
      status: true,
      shippingFee: true,
      deliveryInfo: { select: { city: true, name: true, phone: true, address: true, province: true } },
      createdAt: true,
      message: true,
      items: {
        select: {
          id: true, price: true, quantity: true,
          product: {
            select: {
              id: true,
              images: { select: { id: true }, take: 1 },
              title: true,
            }
          }
        }
      },
    }
  })
  invariant(order, 'Order not available.')
  if (!order.checked) await prisma.order.update({ where: { id: order.id }, data: { checked: true } })
  return json({ order })
}

export default function ManageOrder() {
  const data = useLoaderData<typeof loader>()
  const cancelModalRef = useRef<HTMLDialogElement>(null)
  const fetcher = useFetcher()
  const [selectedStatus, setSelectedStatus] = useState<null | OrderStatus>(null)

  function onChangeStatus(newStatus: OrderStatus, hasCancelMessage?: boolean) {
    if (newStatus === 'CANCELLED') {
      if (!hasCancelMessage) {
        setSelectedStatus(newStatus)
        cancelModalRef.current?.showModal()
        return
      }
      const input = document.getElementById('cancel_message_input') as HTMLTextAreaElement
      if (!input) return
      const message = input.value || ''
      input.value = ''

      fetcher.submit(serialize({ status: newStatus, message }), { method: 'post' })
    } else fetcher.submit(serialize({ status: newStatus }), { method: 'post' })

    cancelModalRef.current?.close()
  }
  return (
    <div className='container mx-auto py-4'>
      <Link to='/dashboard'>
        <Logo />
      </Link>
      <p className='text-5xl font-bold mb-8'>Manage Order</p>

      <Link to='/order' className="w-max block flex btn btn-neutral"><ArrowLeft />Go back</Link>
      <div className="stats my-4 shadow overflow-visible flex flex-col pb-6 md:pb-3 md:flex-row">
        <div className="stat">
          <div className="stat-title">Status</div>
          <div className={classNames('stat-value', getTextColorClassNameByStatus(data.order.status))}>{getStatusLabel(data.order?.status)}</div>
          <div className="stat-desc">Created from {moment(data.order.createdAt).fromNow()}</div>
        </div>
        <div className="dropdown my-auto mr-6 dropdown-end">
          {/*Change dropdown to clicable steps*/}
          <div tabIndex={0} role="button" className={classNames('btn btn-primary whitespace-nowrap', fetcher.state !== 'idle' ? 'opacity-50 pointer-events-none' : '')}>
            Change Status
          </div>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            {orderStatuses.filter(r => r !== data.order.status).map((r, i) => (
              <li key={i}>
                <button
                  disabled={fetcher.state !== 'idle'}
                  onClick={() => onChangeStatus(r as OrderStatus)}
                  className={classNames(getTextColorClassNameByStatus(r))}
                >
                  {getStatusLabel(r)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="my-4">
        <h1 className="text-2xl font-bold mb-4">Purchased items</h1>

        <div className="border-b-2 border-neutral-600">
          {data.order.items.map(r => (
            <div key={r.id} className='py-4 relative'>
              <div className='flex items-start gap-4'>
                <img
                  src={`/api/product_image/${r.product.images[0].id}`}
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
          <p className='text-right text-sm mb-2'>Shipping fees: <b>Rs. {formatNumber(data.order.shippingFee)}</b></p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <p>Total item{data.order.items.length > 1 ? 's' : ''}: <b>{data.order.items.length}</b></p>
          <p>Total amount: <b>Rs. {formatNumber(data.order.total)}</b></p>
        </div>

      </div>


      <div className='mt-8 flex flex-wrap [&>div:min-w-24] gap-8'>
        <div>
          <h1 className="text-2xl font-bold mb-4">Customer Profile</h1>
          <table className="table">
            <tbody>
              {['name', 'phone'].map((r, i) => (
                <tr key={i}>
                  <th className='capitalize'>{r}</th>
                  <td>{(data as any).order.deliveryInfo[r]}</td>
                </tr>
              ))}
              <tr>
                <th className='capitalize'>Purchase Time</th>
                <td>{new Date(data.order.createdAt).toLocaleString()}</td>
              </tr>
              {data.order.status === 'CANCELLED' ? (
                <tr>
                  <th className='capitalize'>Cancellation Message</th>
                  <td className={classNames({ 'italic': !data.order.message?.length })}>{data.order.message || 'EMPTY'}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-4">Delviery Address</h1>
          <p className="text-lg">{data.order.deliveryInfo.address}</p>
          <p>{data.order.deliveryInfo.city} - {data.order.deliveryInfo.province}</p>
        </div>

      </div>

      <dialog ref={cancelModalRef} id="cancel_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Cancellation Message</h3>
          <p className="py-4">
            After changing status to <span className='text-error'>Cancel</span>, it is highly recommended to provide customer a message to enable better understanding.
          </p>
          <div className="form-control">
            <label htmlFor="message" className="label"><span className="label-text">Message</span></label>
            <textarea id='cancel_message_input' className="textarea textarea-bordered" name='message' />
          </div>
          <div className="modal-action">
            <button onClick={() => !selectedStatus ? null : onChangeStatus(selectedStatus, true)} className="min-w-56 btn btn-primary">Submit</button>
            <button onClick={() => cancelModalRef.current?.close()} className="btn">Cancel</button>
          </div>
        </div>
      </dialog>

    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const form = await request.formData()
  const { status: statusMessage, message } = convertFormToJSON(form)
  if (!orderStatuses.includes(statusMessage as OrderStatus)) return json({ error: "Status not available." })
  const id = params.id
  await prisma.order.update({
    where: { id },
    data: {
      status: statusMessage as any,
      message,
    }
  })

  return null
}



export const meta = () => {
  return [
    { title: 'Manage order | Preebee' },
  ]
}
