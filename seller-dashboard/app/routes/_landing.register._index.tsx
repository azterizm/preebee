import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node'
import { Link, useFetcher } from '@remix-run/react'
import classNames from 'classnames'
import { authenticator } from '~/auth.server'
import GoogleLoginButton from '~/components/GoogleLoginButton'
import PasswordInput from '~/components/PasswordInput'
import { prisma, redis } from '~/db.server'
import { getClientIPAddress } from '~/utils/api'
import { createPasswordHash } from '~/utils/auth'

export const meta = () => {
  return [
    { title: 'Create an account | Preebee' },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: '/dashboard',
  })
  return null
}
export default function Register() {
  const fetcher = useFetcher<{
    target: string
    message: string
  }>()
  return (
    <div>
      <h1 className='text-3xl font-bold'>Register</h1>
      <p className='mt-2'>
        Let us a little about yourself and we will get you started in no time.
        Already have an account?{' '}
        <Link to='/login' className='link link-primary'>Login</Link>.
      </p>
      <div className='my-8 space-y-4'>
        <GoogleLoginButton />
        <p className='text-sm'>
          or use your email to register
        </p>
        {fetcher.data?.target === '*'
          ? <p className='text-error'>{fetcher.data.message}</p>
          : null}
        <fetcher.Form method='post'>
          <div className='form-control'>
            <label htmlFor='name' className='label'>
              <span className='label-text'>Name</span>
            </label>
            <input
              type='text'
              autoComplete='name webauthn'
              className={classNames('input input-bordered', {
                'input-error': fetcher.data?.target === 'name',
              })}
              name='name'
            />
          </div>
          <div className='form-control'>
            <label htmlFor='email' className='label'>
              <span className='label-text'>Email</span>
            </label>
            <input
              type='email'
              name='email'
              autoComplete='home email webauthn'
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
                  : 'Password must be at least 8 characters'}
              </span>
            </div>
          </div>
          <p className='mt-4 mb-8'>
            By continuing, you agree to our{' '}
            <Link to='/terms_and_conditions' className='link link-primary' target='_blank'>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to='/privacy_policy' className='link link-primary' target='_blank'>
              Privacy Policy
            </Link>.
          </p>
          <button disabled={fetcher.state !== 'idle'} className='btn btn-primary'>{fetcher.state !== 'idle' ? <span className="loading loading-spinner"></span> : null} Create account</button>
        </fetcher.Form>
      </div>
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.clone().formData()
  const name = form.get('name')?.toString()
  const email = form.get('email')?.toString()
  const password = form.get('password')?.toString()
  const ip = getClientIPAddress(request)

  const tries = await redis.get(`register:${ip}`)

  if (tries && parseInt(tries) > 5) {
    return json({ target: '*', message: 'Too many attempts' })
  }

  await redis.setex(
    `register:${ip}`,
    60 * 60,
    (parseInt(tries || '0') || 0) + 1,
  )

  if (!name || !email || !password) {
    return json({ target: '*', message: 'All fields are required' })
  }

  if (!email.includes('@')) {
    return json({ target: 'email', message: 'Invalid email address' })
  }

  if (password.length < 8) {
    return json({
      target: 'password',
      message: 'Password must be at least 8 characters',
    })
  }

  const exists = await prisma.seller.findFirst({ where: { email } })

  if (exists) {
    return json({ target: 'email', message: 'Email already exists. Please try to login.' })
  }

  const passwordInfo = createPasswordHash(password)

  await prisma.seller.create({
    data: {
      name,
      email,
      passwordHash: passwordInfo.hash,
      passwordSalt: passwordInfo.salt,
      providerName: 'form',
    },
  })

  return authenticator.authenticate('form', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    context: {
      ip,
    },
  })
}
