import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  NodeOnDiskFile,
  redirect,
  unstable_parseMultipartFormData,
} from '@remix-run/node'
import { Form, Link, useFetcher, useLoaderData } from '@remix-run/react'
import { useEffect, useRef } from 'react'
import { authenticator } from '~/auth.server'
import NavbarManageButtons from '~/components/NavbarManageButtons'
import { fileHandler } from '~/config/file'
import { prisma } from '~/db.server'
import { requireSellerWithShop } from '~/session.server'
import {
  compressImageForThumbnail,
  convertFormToJSON,
  generateIdForModel,
} from '~/utils/api'
import Input from './Input'
import Preview from './Preview'
import { submitSchema } from './schema'
import { useProductStore } from './state'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })
  if (!user.shop) return redirect('/')
  const categories = await prisma.category.findMany({
    where: {
      shopId: user.shop?.id,
    },
    select: { name: true, id: true },
  })
  const product = !params.id ? null : await prisma.product.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      title: true,
      price: true,
      stockAvailable: true,
      description: true,
      categories: {
        select: {
          id: true,
        },
      },
      images: {
        select: {
          id: true,
          fileName: true,
          fileSize: true,
          fileType: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return json({ user, categories, product })
}

export default function ProductAdd() {
  const data = useLoaderData<typeof loader>()
  const fetcher = useFetcher<{ error?: string }>()
  const containerRef = useRef<HTMLDivElement>(null)

  const photos = useProductStore((e) => e.photos)
  const reset = useProductStore((e) => e.reset)
  const setProduct = useProductStore((e) => e.setProduct)

  useEffect(() => {
    if (data.product) {
      setProduct(data.product as any)
    }

    return () => {
      reset()
    }
  }, [])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (!photos.length) return alert('Please add at least one photo')
    photos.forEach((r) => r.file ? formData.append('image', r.file) : null)
    fetcher.submit(formData, {
      method: 'post',
      encType: 'multipart/form-data',
    })
  }

  return (
    <div ref={containerRef} className='grid xl:grid-cols-4 h-screen w-screen'>
      <Form
        className='bg-base-200 h-screen flex flex-col'
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between bg-base-300 pl-3 pr-3 py-1 sm:p-4 xl:py-7">
          <div className='space-x-4 flex items-center'>
            <Link to='/products' className='btn btn-sm btn-neutral'>Go back</Link>
            <img className='w-6' src='/logo.svg' alt='logo' />
            {fetcher.data?.error && (
              <p className='text-error text-sm'>{fetcher.data.error}</p>
            )}
          </div>
          <NavbarManageButtons
            hideLabel
            className='flex-none xl:hidden'
            user={data.user}
          />
        </div>
        <Input
          productImages={data.product?.images || []}
          categories={data.categories}
        />
        <div className='space-x-4 flex items-center p-4 bg-base-300 fixed sm:static bottom-0 left-0 w-full'>
          <button
            disabled={fetcher.state !== 'idle'}
            className='btn block w-full btn-primary'
          >
            Submit
          </button>
        </div>
      </Form>
      <div className='hidden xl:block col-span-3'>
        <div className='flex items-center justify-between bg-base-300 py-4 px-8'>
          <div className='flex items-center gap-4'>
            <h1 className='text-xl font-semibold'>Preview</h1>
            <button
              disabled={fetcher.state !== 'idle'}
              onClick={reset}
              className='btn-sm btn-error btn'
            >
              Reset
            </button>
            {data.product
              ? (
                <fetcher.Form method='delete'>
                  <button
                    disabled={fetcher.state !== 'idle'}
                    className='btn-sm btn-warning btn'
                  >
                    Delete this product
                  </button>
                </fetcher.Form>
              )
              : null}
          </div>

          <NavbarManageButtons
            hideLabel
            className='flex-none'
            user={data.user}
          />
        </div>
        <Preview />
      </div>
    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireSellerWithShop(request)

  if (request.method === 'DELETE') {
    await prisma.product.delete({
      where: {
        id: params.id,
        shopId: user.shop.id,
      },
    })
    return redirect('/products', {
      headers: {
        'Set-Cookie': 'message=; Path=/; Max-Age=0',
      },
    })
  }

  const form = await request.clone().formData()
  const fileForm = await unstable_parseMultipartFormData(request, fileHandler)
  let images = fileForm.getAll('image') as unknown as NodeOnDiskFile[]
  const inputRaw = convertFormToJSON(form)
  const categories = form.getAll('category')
  const input = await submitSchema.safeParseAsync({ categories, ...inputRaw })

  if (!input.success) {
    return json({ error: input.error.errors[0].message }, { status: 400 })
  }

  const editingId = params.id

  if (editingId) {
    images = await Promise.all(
      images.map((r) => compressImageForThumbnail(r)),
    ) as any
    const removedImagesId = form.getAll('removed_images_id')
    await prisma.product.update({
      where: {
        id: editingId,
        shopId: user.shop.id,
      },
      data: {
        title: input.data.title,
        price: input.data.price,
        stockAvailable: input.data.stock,
        description: input.data.description,
        categories: {
          set: input.data.categories.map((r) => ({ id: r })),
        },
        images: {
          create: images.map((r) => ({
            fileName: r.name,
            fileSize: r.size,
            fileType: r.type,
          })),
          deleteMany: {
            id: {
              in: removedImagesId as string[],
            },
          },
        },
      },
    })
    return redirect('/products')
  }

  images = await Promise.all(
    images.map((r) => compressImageForThumbnail(r)),
  ) as any

  await prisma.product.create({
    data: {
      id: await generateIdForModel(input.data.title, prisma.product),
      title: input.data.title,
      price: input.data.price,
      stockAvailable: input.data.stock,
      description: input.data.description,
      shopId: user.shop.id,
      categories: {
        connect: input.data.categories.map((r) => ({ id: r })),
      },
      isActive: true,
      images: {
        create: images.map((r) => ({
          fileName: r.name,
          fileSize: r.size,
          fileType: r.type,
        })),
      },
    },
  })

  return redirect('/products', {
    headers: {
      'Set-Cookie': `message=product_add; Path=/; HttpOnly; Max-Age=50`,
    },
  })
}

export const meta = () => {
  return [
    { title: 'Manage product | Preebee' },
  ]
}
