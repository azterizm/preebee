import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  NodeOnDiskFile,
  unstable_parseMultipartFormData,
} from '@remix-run/node'
import { Link, json, useLoaderData } from '@remix-run/react'
import classNames from 'classnames'
import { useRef, useState } from 'react'
import { ChevronLeft } from 'react-feather'
import Carousel from '~/components/Carousel'
import { fileHandler } from '~/config/file'
import { prisma, redis } from '~/db.server'
import { convertFormToJSON, getClientIPAddress, getShopNameFromUrl } from '~/utils/api'
import Header from './Header'
import ImagePreview from './ImagePreview'
import Info from './Info'
import Reviews from './Reviews'
import { getCart } from './cart.server'
import { addReviewSchema } from './schema'
import AboutModal from '../p._index/AboutModal'
import { authenticator } from '~/auth.server'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const id = params.id
  const shopName = getShopNameFromUrl(request)
  const user = await authenticator.isAuthenticated(request)
  const ip = getClientIPAddress(request)
  const product = await prisma.product.findFirst({
    where: { id, isActive: true, shop: { name: shopName } },
    select: {
      id: true,
      title: true,
      price: true,
      description: true,
      images: { select: { id: true } },
      shop: {
        select: {
          id: true,
          title: true,
          color: true,
          logoFileName: true,
          phone: true,
          address: true,
        },
      },
      categories: { select: { id: true, name: true } },
      stockAvailable: true,
      reviews: {
        select: {
          id: true,
          name: true,
          stars: true,
          images: {
            select: {
              id: true,
            },
          },
          message: true,
        },
        where: {
          isPublic: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      averageReview: true,
    },
  })
  if (!product || !ip) {
    throw new Error('Product not found')
  }
  const userReviews = await prisma.review.findMany({
    where: { productId: id, ip },
    select: { id: true },
  })

  const reviewBlocked = (await redis.get(`block_review:${ip}`)) === '1'
  const cart = await getCart(request)
  const isOwner = Boolean(user?.shop && user.shop.id === product.shop.id)

  return json({ product, userReviews, reviewBlocked, cart, shopName, isOwner })
}

export default function PreviewProduct() {
  const data = useLoaderData<typeof loader>()
  const aboutModalRef = useRef<HTMLDialogElement>(null)
  const [fullscreenReviewId, setFullscreenReviewId] = useState<string | null>(
    null,
  )
  return (
    <div
      className={classNames(
        'min-w-screen min-h-screen',
        `bg-${data.product.shop.color}-100`,
      )}
    >
      <div
        className={classNames(
          'px-4 py-16 w-full container mx-auto',
        )}
      >
        <Header
          product={data.product}
          aboutModalRef={aboutModalRef}
          cart={data.cart}
        />

        <Link to='/p' className='my-4 btn btn-primary'>
          <ChevronLeft size={16} /> See all products
        </Link>

        <div className='xl:grid grid-cols-6'>
          <Carousel
            classnames='shadow-lg'
            photos={data.product.images.map((r) =>
              `/api/product_image/${r.id}`
            )}
          />
          <Info isOwner={data.isOwner} product={data.product} />
        </div>

        <Reviews
          onSelect={setFullscreenReviewId}
          product={data.product as any}
          userReviews={data.userReviews}
          disabled={data.reviewBlocked}
        />
      </div>
      <AboutModal ref={aboutModalRef} shop={data.product.shop} />
      <ImagePreview
        onClose={() => setFullscreenReviewId(null)}
        selectedReviewId={fullscreenReviewId}
      />

      <Link
        target='_blank'
        to={import.meta.env.PROD ? 'https://preebee.com/shop' : '/shop'}
        className='fixed bottom-2 left-2 flex gap-2 items-center bg-yellow-300 px-10 py-2 rounded-full z-10'
      >
        <img src='/logo.svg' alt='logo' className='w-8 h-8' />
        <p>Powered by Preebee</p>
      </Link>
    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const form = await request.clone().formData()
  const input = convertFormToJSON(form)
  const action = input.action as string
  const id = params.id as string
  const ip = getClientIPAddress(request)
  if (!ip) {
    return json({ error: 'Invalid device. Please use another one.', action })
  }

  if (action === 'add_review') {
    const isBlocked = await redis.get(`block_review:${ip}`)
    if (isBlocked) {
      return json({ error: 'You can only add one review per day', action })
    }

    const fileForm = await unstable_parseMultipartFormData(request, fileHandler)
    const dataValidation = await addReviewSchema.safeParseAsync(input)
    if (!dataValidation.success) {
      return json({ error: dataValidation.error.message, action })
    }
    const data = dataValidation.data
    const stars = parseInt(data.rating || '0')
    const images = fileForm.getAll('image') as unknown as NodeOnDiskFile[]

    await prisma.review.create({
      data: {
        name: data.name || 'Anonymous',
        stars: stars <= 0 ? 5 : stars,
        productId: id,
        images: {
          create: images.map((r) => ({
            fileName: r.name,
            fileSize: r.size,
            fileType: r.type,
          })),
        },
        ip,
        isPublic: true,
        message: data.message,
      },
    })
      ; (async () => {
        const reviews = await prisma.review.findMany({
          where: { productId: id, isPublic: true },
          select: { stars: true },
        })
        const averageReview = reviews.reduce((acc, r) => acc + r.stars, 0) /
          reviews.length
        await prisma.product.update({
          where: { id },
          data: {
            averageReview,
          },
        })
      })().catch(console.error)

    await redis.setex(`block_review:${ip}`, 60 * 60 * 24, '1')
    return json({ error: null, action })
  }

  if (action === 'delete_review') {
    const reviewId = input.id as string
    const review = await prisma.review.findFirst({
      where: { id: reviewId, ip },
    })
    if (!review) {
      return json({ error: 'Review not found', action })
    }
    await prisma.review.delete({ where: { id: reviewId } })
    return json({ error: null, action })
  }

  return null
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.product.title || 'Personal branded selling platform'} - ${data?.shopName} | Preebee` },
    { name: 'description', content: data?.product.description || `Create your own place in the internet and make it easier for customers to purchase from you.` },
    { name: 'keywords', content: data?.product.categories.map(r => r.name).join(',') },
    {
      name: 'og:description',
      content: data?.product.description || `Create your own place in the internet and make it easier for customers to purchase from you.`
    },
    { name: 'og:image', content: `/api/product_image/${data?.product.images[0].id}` },
    { name: 'twitter:title', content: data?.product.title },
    {
      name: 'twitter:description',
      content: data?.product.description
    },
    { name: 'twitter:image', content: `/api/product_image/${data?.product.images[0].id}` },
    {
      name: 'twitter:image:alt',
      content: data?.product.title,
    },
    { name: 'twitter:card', content: 'summary_large_image' },
    {
      content: data?.product.price,
      property: 'product:price:amount',
    },
    {
      content: 'pkr',
      name: 'product:price:currency',
    },
    {
      content: (data?.product.stockAvailable || 0) > 0 ? 1 : 0,
      name: 'product:availability',
    },
    {
      name: 'twitter:creator',
      content: '@preebee',
    },
    {
      'script:ld+json': {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': data?.product.title,
        'image': `/api/product_image/${data?.product.images[0].id}`,
        'description': data?.product.description,
        'brand': {
          '@type': 'Brand',
          'name': 'Preebee',
        },
      },
    },
  ]
}
