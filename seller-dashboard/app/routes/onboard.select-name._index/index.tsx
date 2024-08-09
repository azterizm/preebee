
import { ActionFunctionArgs, json, redirect } from '@remix-run/node'
import { Form, useFetcher, useLoaderData } from '@remix-run/react'
import { useDebounce } from '@uidotdev/usehooks'
import classNames from 'classnames'
import { serialize } from 'object-to-formdata'
import { useEffect, useState } from 'react'
import { Check, X } from 'react-feather'
import toTime from 'to-time'
import { authenticator } from '~/auth.server'
import { redis } from '~/db.server'
import { generateBusinessNames } from '~/utils/generate'
import { parseShopName } from '~/utils/parse'
import { isNameUsed } from './handle.server'

export async function loader() {
  const names = await generateBusinessNames(5)
  return json({ names })
}

export default function SelectName() {
  const [input, setInput] = useState('')
  const fetcher = useFetcher<{ avialable?: boolean }>()
  const data = useLoaderData<typeof loader>()
  const inputDebounced = useDebounce(input, 800)
  useEffect(() => {
    fetcher.submit(serialize({ action: 'check', name: inputDebounced }), {
      method: 'post',
    })
  }, [inputDebounced])
  const cannotSubmit = !input || !fetcher.data?.avialable || fetcher.state !== 'idle'
  return (
    <Form method='post' className='flex items-center flex-col'>
      <div className='prose text-center'>
        <h1>Select name for your shop.</h1>
        <p className='max-w-sm mx-auto'>
          Make sure it's unique and easy to remember. Your customers will use it
          to find your shop.
        </p>
      </div>
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
        disabled={cannotSubmit}
        className={'mt-8 btn btn-primary'}
        type='submit'
      >
        {fetcher.state !== 'idle' ? (
          <span className="loading loading-spinner"></span>
        ) : null}
        Next
      </button>
    </Form>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })
  const form = await request.formData()
  const action = form.get('action')?.toString()
  if (action === 'check') {
    const name = form.get('name')?.toString()
    const isUsed = !name ? false : await isNameUsed(name)
    return json({
      avialable: !isUsed,
    })
  }

  const name = form.get('input')?.toString()

  if (!name) {
    return redirect('/onboard/select-name')
  }

  const isAvailable = await isNameUsed(name)
  if (isAvailable) {
    return redirect('/onboard/select-name')
  }

  await redis.setex(`lock_shop_name:${name}`, toTime('2h').seconds(), '1')
  await redis.setex(`onboard:${user.id}:name`, toTime('2h').seconds(), name)

  return redirect('/onboard/customize')
}
