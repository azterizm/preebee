import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from '@remix-run/node'
import { Link, json, useFetcher, useLoaderData, useNavigation } from '@remix-run/react'
import { useDebounce, useIntersectionObserver, useWindowScroll } from '@uidotdev/usehooks'
import axios from 'axios'
import classNames from 'classnames'
import _ from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { ArrowUp, ChevronLeft, Plus, Search, X } from 'react-feather'
import { ClientOnly } from 'remix-utils/client-only'
import { authenticator } from '~/auth.server'
import { PRODUCTS_LOADING_LIMIT } from '~/constants/api'
import socialMedia from '~/constants/social_media'
import { prisma, redis } from '~/db.server'
import { convertFormToJSON, getClientIPAddress, getShopNameFromUrl } from '~/utils/api'
import { isShopBanned } from '~/utils/shop'
import Cart from '../p.$id._index/Cart'
import { getCart } from '../p.$id._index/cart.server'
import { cartCookie } from '../p.$id._index/cookies.server'
import AboutModal from './AboutModal'
import ProductRender from './Product'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request)

  const shopName = getShopNameFromUrl(request)
  if (!shopName) return redirect(process.env.APP_URL + '/')

  const isBanned = await isShopBanned(shopName)
  if (isBanned) return redirect('/banned')

  const shop = await prisma.shop.findFirst({
    where: { name: shopName },
    select: {
      id: true,
      title: true,
      color: true,
      phone: true,
      description: true,
      socialMedia: {
        select: {
          name: true,
          id: true,
          link: true,
        },
      },
      layout: true,
      logoFileName: true,
      categories: {
        select: {
          name: true,
          id: true,
        },
      },
      address: true,
    },
  })
  if (!shop) throw new Error('Shop not found')

  const totalProducts = await prisma.product.count({ where: { shopId: shop.id, isActive: true } })
  const cart = await getCart(request)
  const isOwner = Boolean(user?.shop && user.shop.id === shop.id)
  const appURL = process.env.APP_URL

  await redis.hincrby(`views:${shopName}`, `${new Date().getMonth()}:${new Date().getFullYear()}`, 1)

  return json({
    cart,
    shop: {
      ...shop,
      logoFileName: shop.logoFileName ? '/api/logo/' + shop.id : null,
    },
    totalProducts,
    isOwner,
    appURL
  })
}



export default function Preview() {
  const data = useLoaderData<typeof loader>()

  const [{ y: scrollY }] = typeof window === 'undefined'
    ? [{ y: 0 }]
    : useWindowScroll()
  const aboutModalRef = useRef<HTMLDialogElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [cursor, setCursor] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)
  const [firstLoad, setFirstLoad] = useState(false)
  const searchDebounced = useDebounce(search, 500)
  const fetcher = useFetcher<{ error?: null | string; action: string }>()
  const [loaderRef, loaderEntry] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0, root: null, rootMargin: '0px',
  })
  const navigation = useNavigation()

  useEffect(() => {
    setCursor(0)
    setProducts([])
    fetchProducts()
  }, [searchDebounced, category])
  useEffect(() => {
    fetchProducts()
  }, [cursor])

  useEffect(() => {
    if (
      fetcher.data?.action === 'add_to_cart' && !fetcher.data.error &&
      fetcher.state === 'idle'
    ) {
      const el = document.getElementById('cart-panel') as HTMLInputElement
      if (el) el.checked = true
    }
  }, [fetcher])

  useEffect(() => {
    if (
      !fetchLoading &&
      navigation.state === 'idle' &&
      loaderEntry?.isIntersecting &&
      (cursor + PRODUCTS_LOADING_LIMIT) <= data.totalProducts
    ) setCursor(e => e + PRODUCTS_LOADING_LIMIT)
  }, [loaderEntry, navigation])

  async function fetchProducts() {
    setFetchLoading(true)
    const response = await axios.get<{ products: Product[] }>(`/api/products_list/${data.shop.id}?search=${searchDebounced}&category=${category}&cursor=${cursor}`)
    setFetchLoading(false)
    setProducts(e => _.uniqBy([...e, ...response.data.products], 'id'))
    setFirstLoad(true)
  }

  const socialMediaData = data.shop.socialMedia.map((r) => ({
    ...r,
    ...socialMedia.find((v) => v.name === r.name),
  }))

  return (
    <div
      ref={containerRef}
      className={classNames('min-h-screen', 'bg-' + data.shop.color + '-200')}
    >
      <div
        className={classNames(
          'px-4 py-16 w-full container mx-auto',
        )}
      >
        <div className='flex items-center justify-between gap-4 mb-16'>
          <Link to={import.meta.env.PROD ? 'https://preebee.com' : '/'} className='my-4 btn btn-primary'>
            <ChevronLeft size={16} /> See all available products
          </Link>
          <div className="flex items-center gap-4">
            <button
              className={classNames(
                'btn text-neutral-content',
                `bg-${data.shop.color}-600 hover:bg-${data.shop.color}-700`,
              )}
              onClick={() => aboutModalRef.current?.showModal()}
            >
              About
            </button>
            <Cart data={data.cart} />
          </div>
        </div>
        <div
          className={classNames(
            [
              'flex justify-center items-center flex-col',
              'flex items-center gap-4 justify-around w-full',
              'flex justify-center items-center flex-col-reverse',
              'flex items-center gap-4 justify-around w-full flex-row-reverse',
            ][data.shop.layout],
          )}
        >
          {data.shop.logoFileName
            ? (
              <img
                src={data.shop.logoFileName}
                className='w-16 mb-8'
              />
            )
            : null}
          <p className='text-4xl font-bold'>
            {data.shop.title}
          </p>
          {data.shop.description && (
            <p className='max-w-lg mt-2 text-center'>{data.shop.description}</p>
          )}
          <div
            className={classNames(
              [
                'flex items-center gap-4 justify-center w-full mt-12 flex-wrap',
                'flex items-center gap-4 justify-center w-max flex-col',
                'flex items-center gap-4 justify-center w-full mb-12 flex-wrap',
                'flex items-center gap-4 justify-center w-max flex-col',
              ][data.shop.layout],
            )}
          >
            {socialMediaData.map((r) => (
              <Link
                to={r.link}
                key={r.id}
                target='_blank'
                style={{
                  backgroundColor: r.color,
                }}
                className={classNames('btn text-white bg-blue-600')}
              >
                {r.logo} {r.name}
              </Link>
            ))}
          </div>
        </div>
        <div className='flex items-center justify-center gap-2 mt-8 relative w-max mx-auto'>
          <Search className='text-black/90' />{' '}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type='text'
            className='input input-bordered rounded-full'
            placeholder='Search products'
          />
          <ClientOnly fallback={null}>
            {() => (
              <button
                onClick={() => setSearch('')}
                className={classNames(
                  'btn btn-sm btn-circle btn-error absolute right-2 transition-transform transform duration-300',
                  search ? 'scale-100' : 'scale-0',
                )}
              >
                <X size={16} />
              </button>
            )}
          </ClientOnly>
        </div>
        <div className='flex items-center justify-center gap-4 flex-wrap mt-8'>
          {category
            ? (
              <button
                onClick={() => setCategory('')}
                className={classNames(
                  'btn btn-error',
                )}
              >
                {data.shop.categories.find((r) => r.id === category)?.name}{' '}
                <X size={16} />
              </button>
            )
            : data.shop.categories.map((r) => (
              <button
                onClick={() => setCategory(r.id)}
                key={r.id}
                className={classNames(
                  'btn text-neutral-content',
                  `bg-${data.shop.color}-600 hover:bg-${data.shop.color}-700`,
                )}
              >
                {r.name}
              </button>
            ))}
        </div>
        <div className='flex items-center justify-center flex-wrap w-full gap-4 mt-8'>
          {!firstLoad ? (
            <div className='flex flex-col justify-center items-center'>
              <span className="loading loading-spinner loading-xs"></span>
              <p className='mt-4 text-sm animate-pulse'>Loading products...</p>
            </div>
          ) : !products.length
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
          { 'hidden': !data.totalProducts || (cursor + PRODUCTS_LOADING_LIMIT) > data.totalProducts || !firstLoad || searchDebounced }
        )}>
          <span className="loading loading-spinner loading-xs"></span>
          <p className='mt-4 text-sm animate-pulse'>Loading more products...</p>
        </div>
      </div>

      <AboutModal shop={data.shop} ref={aboutModalRef} />

      <ClientOnly>
        {() => (
          <div className='fixed bottom-2 right-2'>
            <button
              onClick={() => (
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                })
              )}
              className={classNames(
                'btn btn-primary btn-circle transition-transform transform duration-300',
                scrollY && scrollY > 100 ? 'scale-100' : 'scale-0',
              )}
            >
              <ArrowUp />
            </button>
          </div>
        )}
      </ClientOnly>

      <Link
        target='_blank'
        to={import.meta.env.PROD ? 'https://preebee.com/shop' : '/shop'}
        className='fixed bottom-2 left-2 flex gap-2 items-center bg-yellow-300 px-10 py-2 rounded-full'
      >
        <img src='/logo.svg' alt='logo' className='w-8 h-8' />
        <p>Powered by Preebee</p>
      </Link>
      {data.isOwner ? (
        <Link
          to={`${data.appURL}/products/manage`}
          className='btn btn-primary fixed bottom-16 lg:bottom-2 left-1/2 -translate-x-1/2 shadow-lg'
        >
          <Plus />
          Add New Product
        </Link>
      ) : null}
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.clone().formData()
  const input = convertFormToJSON(form)
  const action = input.action as string
  const ip = getClientIPAddress(request)

  if (!ip) {
    return json({ error: 'Invalid device. Please use another one.', action })
  }

  if (action === 'add_to_cart') {
    let quantity = parseInt(input.quantity)
    if (isNaN(quantity) || quantity <= 0) {
      return json({ error: 'Invalid quantity', action })
    }
    const id = input.id as string
    const product = await prisma.product.findFirst({
      where: { id },
      select: { stockAvailable: true },
    })
    if (!product || product.stockAvailable < quantity) {
      return json({ error: 'Product not available', action })
    }
    const cookie = request.headers.get('Cookie')
    const cart = await cartCookie.parse(cookie) || []

    if (cart[id] && cart[id] + quantity > product.stockAvailable) {
      return json({ error: 'Not enough stock', action })
    }

    const headers: Record<string, string> = {
      'Set-Cookie': await cartCookie.serialize({
        ...cart,
        [id]: (cart[id] || 0) + quantity,
      }),
    }

    if (input.checkout === 'true') {
      return redirect('/checkout', {
        headers,
      })
    }

    return json({ error: null, action }, {
      headers,
    })
  }

  if (action === 'clear_cart') {
    return json({ error: null, action }, {
      headers: {
        'Set-Cookie': await cartCookie.serialize({}),
      },
    })
  }

  if (action === 'remove_from_cart') {
    const id = input.id as string
    const cookie = request.headers.get('Cookie')
    const cart = await cartCookie.parse(cookie) || {}
    delete cart[id]
    return json({ error: null, action }, {
      headers: {
        'Set-Cookie': await cartCookie.serialize(cart),
      },
    })
  }

  return null
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: (data?.shop.title || 'Personal branded selling platform') + ' | Preebee' },
    { name: 'description', content: data?.shop.description || `Create your own place in the internet and make it easier for customers to purchase from you.` },
    { name: 'keywords', content: data?.shop.categories.map(r => r.name).join(',') },
    {
      name: 'og:description',
      content: data?.shop.description || `Create your own place in the internet and make it easier for customers to purchase from you.`
    },
    { name: 'og:image', content: data?.shop.logoFileName },
    { name: 'twitter:title', content: data?.shop.title },
    {
      name: 'twitter:description',
      content: data?.shop.description
    },
    { name: 'twitter:image', content: data?.shop.logoFileName },
    {
      name: 'twitter:image:alt',
      content: data?.shop.title,
    },
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
}

export interface Product {
  id: string
  title: string
  price: number
  stockAvailable: number
  averageReview: number
  images: {
    id: string
  }[]
  shopId?: string
}
