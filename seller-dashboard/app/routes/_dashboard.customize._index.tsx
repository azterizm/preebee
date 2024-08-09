import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs
} from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import _ from 'lodash'
import { serialize } from 'object-to-formdata'
import { useEffect } from 'react'
import { Save } from 'react-feather'
import { ClientOnly } from 'remix-utils/client-only'
import socialMedia from '~/constants/social_media'
import { prisma } from '~/db.server'
import { logout, requireSellerWithShop } from '~/session.server'
import { convertDataUriToFile, convertFormToJSON } from '~/utils/api'
import Input from './onboard.customize._index/Input'
import Preview from './onboard.customize._index/Preview'
import { submitSchema } from './onboard.customize._index/schema'
import { useSettingsStore } from './onboard.customize._index/state'
import { processSocialMediaInput } from '~/utils/customize'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireSellerWithShop(request)
  const shop = await prisma.shop.findUnique({
    where: { id: user.shop.id },
    include: { socialMedia: true },
  })
  if (!shop) throw logout(request)
  return json({ shop })
}

export default function Customize() {
  const data = useLoaderData<typeof loader>()
  const settings = useSettingsStore()
  const fetcher = useFetcher()

  useEffect(() => {
    settings.setFromShop(data.shop as any)
  }, [])

  function handleSubmit() {
    const input = _.pick(settings, [
      'name',
      'color',
      'layout',
      'description',
      'logoUrl',
      'socialMedia',
      'phone',
    ])
    const parse = submitSchema.safeParse(input)
    if (!parse.success) {
      const key = parse.error.errors[0].path[0]
      const message = parse.error.errors[0].message
      alert(`${typeof key === 'string' ? _.capitalize(key) : key}: ${message}`)
      return
    }
    fetcher.submit(
      serialize(input),
      { method: 'POST' },
    )
  }

  return (
    <div className='grid lg:grid-cols-2 gap-4'>
      <Preview shopName={data.shop.name} />
      <ClientOnly fallback={null}>
        {() => <Input />}
      </ClientOnly>

      <div className='fixed bottom-4 right-4 z-20'>
        <button
          disabled={fetcher.state !== 'idle'}
          onClick={() => handleSubmit()}
          className='btn btn-neutral'
        >
          {fetcher.state !== 'idle' ? 'Saving...' : (
            <>
              <span>{fetcher.data ? 'Saved!' : 'Save Changes'}</span> <Save />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireSellerWithShop(request)
  const form = await request.formData()
  const body = convertFormToJSON(form)
  let input = await submitSchema.parseAsync(body)
  input.socialMedia = (
    input.socialMedia?.map(processSocialMediaInput).filter(Boolean) || []
  ) as typeof input.socialMedia
  const logoFileName = input.logoUrl?.startsWith('/')
    ? undefined
    : !input.logoUrl
      ? null
      : await convertDataUriToFile(input.logoUrl, user.shop.id)
  await prisma.shop.update({
    where: { id: user.shop.id },
    data: {
      title: input.name,
      color: input.color,
      layout: input.layout,
      description: input.description || '',
      phone: input.phone,
      socialMedia: {
        deleteMany: {},
        create: input.socialMedia?.map((r) => ({
          name: r.name,
          link: r.url as string,
        })) || [],
      },
      logoFileName,
    },
  })
  return json({ message: "done" })
}
