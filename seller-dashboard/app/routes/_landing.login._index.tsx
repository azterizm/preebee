import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import classNames from 'classnames'
import { authenticator } from '~/auth.server'
import GoogleLoginButton from '~/components/GoogleLoginButton'
import PasswordInput from '~/components/PasswordInput'
import { commitSession, getSession } from '~/session.server'
import { getClientIPAddress } from '~/utils/api'


export const meta = () => {
  return [
    { title: 'Login | Preebee' },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: '/dashboard',
  })
  const session = await getSession(
    request.headers.get('Cookie'),
  )
  const error = session.get(authenticator.sessionErrorKey)
  return json({ error }, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  })
}

export default function Login() {
  const { error } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<{
    target: string
    message: string
  }>()
  return (
    <div>
      <h1 className='text-3xl font-bold'>Login</h1>
      <p className='mt-2'>
        Welcome back! Please login to your account. If you don't have an
        account,{' '}
        <Link to='/register' className='link link-primary'>
          Create new account
        </Link>.
      </p>
      <div className='my-8 space-y-4'>
          <GoogleLoginButton />
        <fetcher.Form method='post'>
          {error ? <p className='text-error mb-2'>{error.message}</p> : null}
          <div className='form-control'>
            <label htmlFor='email' className='label'>
              <span className='label-text'>Email</span>
            </label>
            <input
              type='email'
              name='email'
              className={classNames('input input-bordered', {
                'input-error': fetcher.data?.target === 'email',
              })}
            />
            {fetcher.data?.target === 'email'
              ? (
                <div className='label'>
                  <span className='label-text-alt text-error'>
                    {fetcher.data.message}
                  </span>
                </div>
              )
              : null}
          </div>
          <div className='form-control'>
            <label htmlFor='password' className='label'>
              <span className='label-text'>Password</span>
            </label>

            <PasswordInput />

            <div className='label'>
              <span
                className={classNames(
                  'label-text-alt',
                  { 'text-error': fetcher.data?.target === 'password' },
                )}
              >
                {fetcher.data?.target === 'password'
                  ? fetcher.data.message
                  : ''}
              </span>

              <Link to='/forgot-password' className='label-text-alt link'>
                Forgot password?
              </Link>
            </div>
          </div>

          <button disabled={fetcher.state !== 'idle'} className='btn btn-primary'>{fetcher.state!=='idle' ? <span className="loading loading-spinner"></span> : null} Login</button>
        </fetcher.Form>
      </div>
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  return authenticator.authenticate('form', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    context: {
      ip: getClientIPAddress(request),
    },
  })
}
