import { json, type MetaFunction } from '@remix-run/node'
import toTime from 'to-time'
import { useLoaderData, useNavigation } from '@remix-run/react'
import { useDebounce, useIntersectionObserver } from '@uidotdev/usehooks'
import { useEffect, useState } from 'react'
import { HOME_PAGE_PRODUCTS_LOADING_LIMIT } from '~/constants/api'
import { prisma } from '~/db.server'
import { type Product } from '../p._index'
import ProductRender from '../p._index/Product'
import classNames from 'classnames'
import axios from 'axios'
import _ from 'lodash'
import { Search } from 'react-feather'

export const meta: MetaFunction = () => {
  return [
    { title: 'Purchase from your favourite sellers | Preebee' },
    { name: 'description', content: `Now it is easy to buy from your favourite sellers.` },
  ]
}

export const loader = async () => {
  const totalProducts = await prisma.product.count({ where: { isActive: true, stockAvailable: { gt: 0 } } })
  return json({ totalProducts }, { headers: { 'Cache-Control': `max-age=${toTime('1d').seconds()}, public` } })
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  const [products, setProducts] = useState<ProductT[]>([])
  const [cursor, setCursor] = useState(0)
  const [search, setSearch] = useState('')
  const searchDebounced = useDebounce(search, 500)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [firstLoad, setFirstLoad] = useState(false)

  const navigation = useNavigation()
  const [loaderRef, loaderEntry] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0, root: null, rootMargin: '0px',
  })

  useEffect(() => {
    setCursor(0)
    setProducts([])
    fetchProducts()
  }, [searchDebounced])
  useEffect(() => {
    fetchProducts()
  }, [cursor])
  useEffect(() => {
    if (
      !fetchLoading &&
      navigation.state === 'idle' &&
      loaderEntry?.isIntersecting &&
      (cursor + HOME_PAGE_PRODUCTS_LOADING_LIMIT) <= data.totalProducts
    ) setCursor(e => e + HOME_PAGE_PRODUCTS_LOADING_LIMIT)
  }, [loaderEntry, navigation])

  async function fetchProducts() {
    setFetchLoading(true)
    const response = await axios.get<{ products: ProductT[] }>(`/api/products_list?search=${searchDebounced}&cursor=${cursor}`)
    setFetchLoading(false)
    setProducts(e => _.uniqBy([...e, ...response.data.products], 'id'))
    setFirstLoad(true)
  }

  return (
    <div className='py-16'>
      <div className="flex items-center justify-center flex-col">
        <h1 className="mb-4 text-3xl font-bold">Search</h1>
        <label className="input input-bordered flex items-center gap-2">
          <input name='search' type="text" className="grow" placeholder="Type here..." value={search} onChange={e => setSearch(e.target.value)} />
          <Search />
        </label>
      </div>

      <div className="flex items-center justify-center flex-wrap w-full gap-4 mt-8">
        {!firstLoad ? null : !products.length
          ? (
            <p className='text-lg text-secondary'>
              {search
                ? 'No product are found for this search.'
                : 'No products are available today. Come back next time!'}
            </p>
          )
          : (
            products.map((r) => (
              <ProductRender key={r.id} {...r} />
            ))
          )}
      </div>

      <div ref={loaderRef} className={classNames('flex items-center justify-center flex-col mt-16',
        { 'hidden': !data.totalProducts || (cursor + HOME_PAGE_PRODUCTS_LOADING_LIMIT) > data.totalProducts || !firstLoad || searchDebounced.length }
      )}>
        <span className="loading loading-spinner loading-xs"></span>
        <p className='mt-4 text-sm animate-pulse'>Loading more products...</p>
      </div>


    </div>
  )
}

type ProductT = Product & { shopId: string }
