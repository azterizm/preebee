import { LoaderFunctionArgs, json } from '@remix-run/node'
import toTime from 'to-time'
import { authenticator } from '~/auth.server'
import { HOME_PAGE_PRODUCTS_LOADING_LIMIT, PRODUCTS_LOADING_LIMIT } from '~/constants/api'
import { prisma } from '~/db.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request)
  const url = new URL(request.url)
  const shopId = params.shopId
  const searchParams = url.searchParams
  const search = searchParams.get('search')
  const category = searchParams.get('category')
  const cursor = searchParams.get('cursor') || '0'
  const isOwner = user?.shop && user.shop.id === shopId

  const products = await prisma.product.findMany({
    where: {
      shopId,
      title: !search ? undefined : {
        contains: search,
      },
      categories: !category ? undefined : {
        some: {
          id: category,
        },
      },
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      price: true,
      averageReview: true,
      stockAvailable: true,
      images: { select: { id: true }, take: 1, orderBy: { createdAt: 'desc' } },
      shopId: shopId ? false : true
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: shopId ? PRODUCTS_LOADING_LIMIT : HOME_PAGE_PRODUCTS_LOADING_LIMIT,
    skip: Number(cursor) || 0
  })

  console.log({ products })


  return json({ products }, {
    headers: {
      'Cache-Control': isOwner || process.env.NODE_ENV !== 'production' ? `no-cache, no-store, must-revalidate` : `max-age=${toTime('1h').seconds()}, public`
    }
  })
}
