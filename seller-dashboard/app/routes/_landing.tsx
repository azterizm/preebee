import { LoaderFunctionArgs, json, redirect } from '@remix-run/node'
import { Link, Outlet, useLoaderData, useLocation, useNavigation } from '@remix-run/react'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { XCircle } from 'react-feather'
import { authenticator } from '~/auth.server'
import ListIcon from '~/components/ListIcon'
import Logo from '~/components/Logo'
import { getShopNameFromUrl } from '~/utils/api'

export async function loader({ request }: LoaderFunctionArgs) {
  const shopName = getShopNameFromUrl(request)
  if (shopName) return redirect('/p')
  const user = await authenticator.isAuthenticated(request)
  return json({ user: Boolean(user) })
}

export default function LandingContainer() {
  const data = useLoaderData<typeof loader>()
  const [showMenu, setShowMenu] = useState(false)
  const navigation = useNavigation()
  const location = useLocation()
  useEffect(() => {
    setShowMenu(false)
  }, [navigation])
  return (
    <>
      <div className='navbar bg-base-200 sticky top-0 left-0 mb-8 w-full z-10'>
        <div className='flex-1'>
          <Link to='/' className='btn btn-ghost text-xl'>
            <Logo className='!text-3xl' />
          </Link>
        </div>
        <div className={classNames('flex-none items-center gap-6 md:flex flex-col md:flex-row', showMenu ? '' : 'hidden')}>
          <div className="flex items-center gap-2">
            <Link to='mailto:contact@preebee.com' className="btn btn-ghost">Contact</Link>
          </div>
          {data.user ? (
            <Link to='/dashboard' className="btn btn-primary">Open Dashboard</Link>
          ) : (
            <div className="flex items-center gap-2 flex-col md:flex-row">
              <Link to='/login' className="btn btn-primary btn-outline">Login</Link>
              {location.pathname === '/shop' ? (
                <Link to='/register' className="btn btn-primary">Create account</Link>
              ) : (
                <Link to='/shop' className="btn btn-primary">Open your shop</Link>
              )}
            </div>
          )}
        </div>
        <button onClick={() => setShowMenu(e => !e)} className="md:hidden btn btn-ghost">{showMenu ? (
          <XCircle />
        ) : (
          <ListIcon />
        )}</button>
      </div>
      <div className='container mx-auto'>
        <Outlet />
      </div>
    </>
  )
}
