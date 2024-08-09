import { LoaderFunctionArgs, json } from "@remix-run/node"
import { Link, useLoaderData, useSearchParams } from "@remix-run/react"
import classNames from "classnames"
import { useDeferredValue, useEffect, useState } from "react"
import SearchInput from "~/components/SearchInput"
import { prisma } from "~/db.server"
import { requireSellerWithShop } from "~/session.server"
import { formatNumber } from "~/utils/ui"
import RenderStatusTableData, { getStatusLabel, getTextColorClassNameByStatus } from "../invoice.$id._index/RenderStatusTableData"
import { OrderStatus, orderStatuses } from '~/types/db'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const user = await requireSellerWithShop(request)
  const filterStatus = url.searchParams.get('filter_status')
  const search = url.searchParams.get('search')
  const orders = await prisma.order.findMany({
    where: {
      shopId: user.shop.id,
      status: !filterStatus || filterStatus && !orderStatuses.includes(filterStatus as OrderStatus) ? undefined : filterStatus as any,
      OR: !search ? undefined : [
        {
          deliveryInfo: {
            OR: [
              { name: { contains: search } },
              { city: { contains: search } },
              { phone: { contains: search } },
              { address: { contains: search } },
              { province: { contains: search } },
            ]
          },
        },
        {
          items: {
            some: { product: { title: { contains: search } } }
          }
        }
      ]
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      total: true,
      status: true,
      checked: true
    }
  })

  const itemsCount = await Promise.all(orders.map(async order => {
    const items = await prisma.orderItem.findMany({
      where: {
        orderId: order.id,
      },
      select: {
        quantity: true,
      }
    })
    return items.reduce((acc, item) => acc + item.quantity, 0)
  }))

  return json({
    orders: orders.map((order, index) => ({ ...order, itemsCount: itemsCount[index] }))
  })
}

export default function Orders() {
  const data = useLoaderData<typeof loader>()
  const [selectedFilterByStatus, setSelectedFilterByStatus] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    setSearchParams({ search: deferredSearch, filter_status: selectedFilterByStatus })
  }, [deferredSearch, setSearchParams, selectedFilterByStatus])

  return (
    <div>
      <div className="flex w-full mb-2 justify-between items-center flex-col xl:flex-row gap-y-4">
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search"
          className="sm:min-w-[22rem]"
        />
        <div className="flex items-center gap-4">
          <div className="dropdown mb-2 dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-secondary flex gap-2">
              Filter by Status
              {selectedFilterByStatus ? ': ' + getStatusLabel(selectedFilterByStatus) : null}
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li >
                <button onClick={() => setSelectedFilterByStatus('')} >
                  None
                </button>
              </li>
              {orderStatuses.map((r, i) => (
                <li key={i}>
                  <button onClick={() => setSelectedFilterByStatus(r)} className={classNames(getTextColorClassNameByStatus(r))}>
                    {getStatusLabel(r)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
      <div className="overflow-x-auto max-w-[90vw]">
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Items ordered</th>
              <th>Order at</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map(order => (
              <tr key={order.id}>
                <RenderStatusTableData showNewLabel={!order.checked} status={order.status} />
                <td>Rs. {formatNumber(order.total)}</td>
                <td>{Intl.NumberFormat('en-US').format(order.itemsCount)}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td><Link to={order.id} className="btn btn-sm btn-primary">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const meta = () => {
  return [
    { title: 'Orders | Preebee' },
  ]
}
