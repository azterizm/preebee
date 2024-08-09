import { useLocation, useNavigate, useNavigation } from '@remix-run/react'
import classNames from 'classnames'

export default function MenuItem(props: {
  to: string
  label: string
  icon?: React.ReactNode
  badge?: string | null
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const navigation = useNavigation()
  return (
    <li>
      <div
        className={classNames(location.pathname.startsWith(props.to) ? 'active' : '', { 'opacity-50 pointer-events-none': navigation.state !== 'idle' })}
        onClick={() => navigate(props.to)}
      >
        {props.label} {props.icon}{' '}{props.badge ? <span className="badge badge-sm badge-error">{props.badge}</span> : null}
      </div>
    </li>
  )
}
