import { ActionFunctionArgs, json, redirect } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { useDebounce } from '@uidotdev/usehooks'
import classNames from 'classnames'
import { serialize } from 'object-to-formdata'
import { useEffect, useState } from 'react'
import { Check, X } from 'react-feather'
import { generateBusinessNames } from '~/utils/generate'
import { parseShopName } from '~/utils/parse'
import { LoaderFunctionArgs } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { commitSession, getSession, requireSellerWithShop } from "~/session.server"
import { prisma } from '~/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireSellerWithShop(request)
  const names = await generateBusinessNames(5)
  return json({ name: user.shop.name, names })
}

export default function ChangeShop() {
  const [input, setInput] = useState('')
  const fetcher = useFetcher<{ avialable?: boolean }>()
  const data = useLoaderData<typeof loader>()
  const inputDebounced = useDebounce(input, 800)

  useEffect(() => {
    if (!inputDebounced) return
    fetcher.submit(serialize({ action: 'check', name: inputDebounced }), {
      method: 'post',
      action: '/onboard/select-name'
    })
  }, [inputDebounced])

  function onSubmit() {
    if (!input || !fetcher.data?.avialable || fetcher.state !== 'idle') return
    fetcher.submit(serialize({ input }), {
      method: "post"
    })
  }

  return (
    <div className='p-4'>
      <div className="flex items-center justify-between text-center">
        <Link to='/profile' className="btn btn-neutral">Go back</Link>
        <h1 className="-translate-x-8 text-lg font-bold">Change Website</h1>
        <div />
      </div>

      <p className='text-xl text-center mt-8'>
        Current<br />
        <span className="text-2xl font-semibold">{data.name}.preebee.com</span>
      </p>

      <div className='my-16 space-y-4'>
        <label className='input input-bordered flex items-center gap-2 w-max mx-auto'>
          <input
            type='text'
            className='grow'
            placeholder={'Enter your shop name'}
            value={input}
            onChange={(e) => setInput(parseShopName(e.target.value))}
            name='input'
          />
          <span className='badge badge-info'>.preebee.com</span>
        </label>
        {fetcher.state !== 'idle'
          ? <div className='loading loading-spinner block mx-auto' />
          : !input
            ? null
            : fetcher.data?.avialable
              ? (
                <div className='flex items-center justify-center gap-2 mx-auto badge badge-success'>
                  <span>
                    Available
                  </span>
                  <Check className='w-4 inline' />
                </div>
              )
              : (
                <div>
                  <div className='flex items-center justify-center gap-2 mx-auto badge badge-error'>
                    <span>
                      Not Available
                    </span>
                    <X className='w-4 inline' />
                  </div>
                  <div className='p-4 bg-base-200 mt-4'>
                    <h1 className='text-lg font-semibold mb-4'>Suggestions</h1>
                    <div className='flex items-center gap-4 flex-wrap'>
                      {data.names.map((r, i) => (
                        <button
                          onClick={() => setInput(r)}
                          key={i}
                          type='button'
                          className={classNames(
                            'btn btn-sm',
                            r === input ? 'btn-primary' : 'btn-info',
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
      </div>
      <button
        disabled={!input || !fetcher.data?.avialable ||
          fetcher.state !== 'idle'}
        className='mt-8 btn btn-primary mx-auto block'
        onClick={onSubmit}
      >
        Submit
      </button>
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData()
  const input = form.get('input')?.toString() || ''
  if (!input) return redirect('/profile')

  const isAvailable = await prisma.shop.count({
    where: { name: input, },
  })

  if (isAvailable) {
    return redirect('/profile')
  }

  const user = await requireSellerWithShop(request)

  await prisma.shop.update({
    where: { id: user.shop.id },
    data: { name: input }
  })

  const session = await getSession(request.headers.get('Cookie'))
  session.set(`user`, {
    ...user,
    shop: {
      ...user.shop,
      name: input
    }
  })

  return redirect('/profile', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  })
}
