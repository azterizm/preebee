import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node'
import { Link, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react'
import classNames from 'classnames'
import { serialize } from 'object-to-formdata'
import { useDeferredValue, useEffect, useState } from 'react'
import { ChevronDown, Plus, Truck } from 'react-feather'
import { ClientOnly } from 'remix-utils/client-only'
import SearchInput from '~/components/SearchInput'
import { prisma } from '~/db.server'
import { requireSellerWithShop } from '~/session.server'
import { formatList, formatNumber } from '~/utils/ui'
import { sortByKeys, sortByKeyValues } from './constants'
import FirstProductDialog from './FirstProductDialog'
import ShippingDialog from './ShippingDialog'
import StockDialog from './StockDialog'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireSellerWithShop(request)
  const searchParams = new URL(request.url).searchParams
  const search = searchParams.get('search') || ''
  const sortBy = searchParams.get('sort_by') || 'createdAt'
  const products = await prisma.product.findMany({
    where: {
      shopId: user.shop.id,
      OR: !search ? undefined : [
        { title: search },
        { categories: { some: { name: { contains: search } } } },
      ].concat(search && !isNaN(Number(search)) ? [
        { price: Number(search) },
        { stockAvailable: Number(search) }
      ] as any : [])
    },
    select: {
      id: true,
      title: true,
      price: true,
      isActive: true,
      stockAvailable: true,
      categories: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { [sortBy]: sortBy === 'createdAt' ? 'desc' : 'asc' }
  })
  const shop = await prisma.shop.findUnique({
    where: {
      id: user.shop.id,
    },
    select: {
      shippingFee: true,
    },
  })

  const cookie = request.headers.get('Cookie')
  const recentlyCreatedProduct = cookie?.includes('message=product_add')

  return json({ products, shop, recentlyCreatedProduct })
}

export default function Products() {
  const data = useLoaderData<typeof loader>()
  const fetcher = useFetcher<{ error?: string }>()

  const [search, setSearch] = useState('')
  const [changeStock, setChangeStock] = useState<
    {
      id: string
      stock: number
      title: string
    } | null
  >(null)
  const [sortBy, setSortBy] = useState<typeof sortByKeys[number]>('createdAt')

  const [_, setSearchParams] = useSearchParams()
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    setSearchParams({ search: deferredSearch, sort_by: sortBy })
  }, [deferredSearch, setSearchParams, sortBy])

  function onToggleActive(id: string, current: boolean) {
    fetcher.submit(
      serialize({ id, action: 'toggle_active', current: current ? 1 : 0 }),
      {
        method: 'post',
      },
    )
  }

  function onChangeStock(id: string, stockAvailable: number, title: string) {
    setChangeStock({ id, stock: stockAvailable, title })
    const dialog = document.getElementById('stock_modal') as HTMLDialogElement
    dialog.showModal()
  }

  return (
    <div>
      <div className="flex sm:items-center sm:justify-between items-start justify-start my-4 gap-4 flex-col xl:flex-row">
        <div className="flex sm:items-center items-start gap-2 flex-col sm:flex-row">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search"
          />
          <div className="dropdown mb-2 dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-secondary flex gap-2 translate-y-1 btn-outline">
              Sort by
              {sortBy ? ' ' + sortByKeyValues[sortBy] : null}
              <ChevronDown />
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              {sortByKeys.filter(r => r !== sortBy).map((r, i) => (
                <li key={i}>
                  <button onClick={() => setSortBy(r)} className='focus:bg-white'>
                    {sortByKeyValues[r]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='flex items-start sm:items-center gap-2 flex-col sm:flex-row'>
          <button
            className='w-max btn btn-secondary flex items-center gap-2'
            onClick={() => {
              const dialog = document.getElementById(
                'shipping_modal',
              ) as HTMLDialogElement
              dialog.showModal()
            }}
          >
            <Truck /> <span>Change Shipping Fees</span>
          </button>
          <Link
            to='manage'
            className='w-max btn btn-primary flex items-center gap-2'
          >
            <Plus /> <span>Add new product</span>
          </Link>
        </div>
      </div>

      {fetcher.data?.error && <p className='text-error'>{fetcher.data.error} </p>}
      <div className='overflow-x-auto max-w-[90vw] sm:max-w-full'>
        {!data.products.length ? (
          <p className="text-center my-4 text-lg font-medium">No products created yet. <Link className='link link-primary' to='manage'>Add one</Link>!</p>
        ) : (
          <table className='table'>
            <thead>
              <tr>
                {['Name', 'Categories', 'Price', 'Active', 'Stock', 'Actions']
                  .map((r, i) => <th key={i}>{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.products.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>
                    {formatList(
                      r.categories.map((c) => c.name),
                    )}
                  </td>
                  <td>Rs. {r.price}</td>
                  <td
                    data-tip={r.isActive
                      ? 'This product is active'
                      : 'This product is not active so it will not be visible to customers'}
                    className={classNames(
                      r.isActive ? 'text-success' : 'text-error',
                      'tooltip cursor-default',
                    )}
                  >
                    {r.isActive ? 'Yes' : 'No'}
                    {!r.stockAvailable ? (
                      <span className='text-error'>{' '}(No stock)</span>
                    ) : null}
                  </td>
                  <td>{formatNumber(r.stockAvailable)}</td>
                  <td className='flex flex-wrap gap-4'>
                    <Link className='btn btn-sm' to={`manage/${r.id}`}>Edit</Link>
                    <button
                      onClick={() =>
                        onChangeStock(r.id, r.stockAvailable, r.title)}
                      className='btn btn-sm'
                    >
                      {!r.stockAvailable ? 'Add' : 'Change'} Stock
                    </button>
                    <button
                      onClick={() => onToggleActive(r.id, r.isActive)}
                      className={classNames(
                        'btn btn-sm btn-outline',
                        r.isActive ? 'btn-error' : 'btn-success',
                      )}
                      disabled={fetcher.state !== 'idle' || (
                        !r.isActive && r.stockAvailable === 0
                      )}
                    >
                      {r.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        )}
      </div>

      <StockDialog info={changeStock} />
      <ShippingDialog defaultValue={data.shop?.shippingFee || 0} />
      <ClientOnly>
        {() => (
          data.recentlyCreatedProduct && data.products.length === 1 && !data.shop?.shippingFee
            ? (
              <FirstProductDialog

                shippingFee={data.shop?.shippingFee || 0}
              />
            )
            : null
        )}
      </ClientOnly>
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireSellerWithShop(request)
  const body = await request.formData()
  const id = body.get('id')?.toString()
  const action = body.get('action')
  if (action === 'toggle_active') {
    if (!id) {
      return json({ error: 'Invalid request' }, { status: 400 })
    }
    const current = body.get('current') === '1'
    await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        isActive: !current,
      },
    })
  }
  if (action === 'change_stock') {
    const stock = Number(body.get('stock'))
    if (!id || isNaN(stock)) {
      return json({ error: 'Invalid request' }, { status: 400 })
    }
    await prisma.product.update({
      where: {
        id,
      },
      data: {
        stockAvailable: stock,
        isActive: stock <= 0 ? false : undefined,
      },
    })
  }
  if (action === 'update_shipping_fees') {
    const shippingFee = Number(body.get('value'))
    await prisma.shop.update({
      where: {
        id: user.shop.id,
      },
      data: {
        shippingFee,
      },
    })
  }
  return json({ id }, {
    headers: {
      'Set-Cookie': 'message=; Path=/; Max-Age=0',
    },
  })
}

export const meta = () => {
  return [
    { title: 'Products | Preebee' },
  ]
}
