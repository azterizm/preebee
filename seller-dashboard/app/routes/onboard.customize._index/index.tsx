import toTime from 'to-time'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import _ from 'lodash'
import { serialize } from 'object-to-formdata'
import { ChevronRight } from 'react-feather'
import { authenticator } from '~/auth.server'
import socialMedia from '~/constants/social_media'
import { prisma, redis } from '~/db.server'
import {
  convertDataUriToFile,
  convertFormToJSON,
  generateIdForModel,
} from '~/utils/api'
import { getOnboardData, resetOnboardData } from '../onboard/handle.server'
import Input from './Input'
import Preview from './Preview'
import { submitSchema } from './schema'
import { useSettingsStore } from './state'
import classNames from 'classnames'
import { processSocialMediaInput } from '~/utils/customize'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })
  const data = await getOnboardData(user.id)
  if (!data.name) {
    return redirect('/onboard')
  }
  return json({ name: data.name })
}

export default function Customize() {
  const data = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const { name, color, layout, logoUrl, socialMedia, phone } =
    useSettingsStore()

  function handleSubmit() {
    const input = {
      name: name || data.name,
      color,
      layout,
      logoUrl,
      socialMedia,
      phone,
    }
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
    <div>
      <div className='prose text-center mx-auto'>
        <h1>Style your shop.</h1>
        <p>
          Make your shop look and feel the way you want it to. You can come back
          here anytime to change your settings.
        </p>
      </div>
      <div className='lg:grid grid-cols-2 gap-4 w-full mt-8'>
        <Preview shopName={data.name} />
        <Input />
        <button
          onClick={handleSubmit}
          disabled={fetcher.state !== 'idle'}
          className='btn block w-full btn-primary col-span-2 flex items-center gap-2 justify-between mb-24'
        >
          <span className={classNames({ 'loading loading-spinner': fetcher.state !== 'idle' })}></span>
          <span>
            Save & Continue
          </span>{' '}
          <ChevronRight />
        </button>
      </div>
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })
  const form = await request.formData()
  const body = convertFormToJSON(form)
  let input = await submitSchema.parseAsync(body)
  input.socialMedia = (
    input.socialMedia?.map(processSocialMediaInput).filter(Boolean) || []
  ) as typeof input.socialMedia

  const onboardData = await getOnboardData(user.id)
  if (!onboardData.name) {
    resetOnboardData(user.id)
    return redirect('/onboard')
  }
  const id = await generateIdForModel(onboardData.name, prisma.shop)
  const logoFileName = !input.logoUrl
    ? null
    : await convertDataUriToFile(input.logoUrl, id)

  await redis.setex(
    `onboard:${user.id}:customize`,
    toTime('2h').seconds(),
    JSON.stringify({ ...input, logoUrl: '', logoFileName, id }),
  )

  return redirect('/onboard/done')
}
