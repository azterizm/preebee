import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { authenticator } from '~/auth.server'
import Logo from '~/components/Logo'
import LogoutButton from '~/components/LogoutButton'
import { getOnboardData } from './handle.server'
import Reset from './Reset'
import { Step } from './types'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })
  let step = Step.Done
  const { customize, name } = await getOnboardData(user.id)
  if (!name) step = Step.SelectName
  else if (!customize) step = Step.Customize
  const targetUrl =
    ['/onboard/select-name', '/onboard/customize', '/onboard/done'][step]
  const url = new URL(request.url)
  if (url.pathname !== targetUrl) {
    return redirect(targetUrl)
  }
  return json({ step })
}

export default function Onboard() {
  const { step } = useLoaderData<typeof loader>()

  return (
    <div className='container mx-auto'>
      <div className='navbar bg-base-100 mb-8 rounded-b-lg lg:rounded-none flex-col sm:flex-row'>
        <div className='navbar-start hidden sm:block'>
          {step > 0 && step !== Step.Done ? <Reset /> : null}
        </div>
        <div className='navbar-center'>
          <Logo className='text-center mx-auto' />
        </div>
        <div className='navbar-end justify-center sm:justify-end gap-4 mt-4 lg:mt-0'>
          {step > 0 && step !== Step.Done ? <Reset className='sm:hidden' /> : null}
          <LogoutButton />
        </div>
      </div>

      <ul className='steps w-full'>
        {['Select Name', 'Customize', 'Done'].map((s, i) => (
          <li key={i} className={`step ${step >= i ? 'step-primary' : ''}`}>
            {s}
          </li>
        ))}
      </ul>
      <div className='my-8'>
        <Outlet />
      </div>
    </div>
  )
}

export const meta = () => {
  return [
    { title: 'Onboard | Preebee' },
  ]
}
