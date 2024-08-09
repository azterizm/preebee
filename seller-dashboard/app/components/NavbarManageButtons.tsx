import { useLocation, useNavigate } from '@remix-run/react'
import { useClickAway } from '@uidotdev/usehooks'
import axios from 'axios'
import classNames from 'classnames'
import { LogOut, User } from 'react-feather'
import { navData } from '~/constants/ui'
import { AuthUser } from '~/types/auth'

export default function NavbarManageButtons(props: {
  user: AuthUser
  className?: string
  hideLabel?: boolean
  onToggleMenu?: () => void
  isOpen?: boolean
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = typeof window === 'undefined' ? null : useClickAway(() => !props.isOpen || !props.onToggleMenu ? null : props.onToggleMenu())
  const activeItem = navData.find((r) => {
    if (typeof r.to === 'string') return r.to === location.pathname
    return r.to.some((sub) => sub.to === location.pathname)
  })

  async function onLogout() {
    await axios.post('/auth/logout', null, {
      withCredentials: true,
    })
    navigate('/')
  }

  return (
    <div
      className={classNames(
        'flex items-center space-x-4',
        props.className,
      )}
      ref={containerRef as any}
    >
      {props.hideLabel
        ? null
        : (
          <div className="flex items-center gap-4 flex-1">
            <button className='btn xl:hidden' onClick={props.onToggleMenu}>
              <img src='/icons/menu.svg' alt='menu icon' className='w-6' />
            </button>
            <h1 className='text-3xl'>{activeItem?.label || 'Home'}</h1>
          </div>
        )}

      {/*
      <div className="dropdown mb-2 dropdown-end">
        <div tabIndex={0} role='button' className='btn btn-ghost'>
          <Bell />
          <div className='badge badge-error'>+3</div>
        </div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52">
          <li >
            <button className='focus:bg-white'>
              Test
            </button>
          </li>
        </ul>
      </div>
      */}

      <div className='dropdown dropdown-end dropdown-hover'>
        <div role='button' tabIndex={0} className='m-1 btn btn-circle' onClick={() => navigate('/account')}>
          {props.user?.avatarURL
            ? (
              <img
                src={props.user.avatarURL}
                alt={props.user.name}
                className='rounded-full'
              />
            )
            : <User size={24} />}
        </div>
        <ul
          tabIndex={0}
          className='p-2 shadow menu dropdown-content z-[1] bg-base-200 rounded-box min-w-52 w-max'
        >
          <li>
            <button
              onClick={() => navigate('/account')}
              className='flex justify-between'
            >
              Account
            </button>
          </li>
          <li>
            <button
              onClick={onLogout}
              className='hover:bg-error flex justify-between'
            >
              <span>Logout</span> <LogOut size={16} />
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
