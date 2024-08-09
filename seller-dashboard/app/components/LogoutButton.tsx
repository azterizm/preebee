import { Form } from '@remix-run/react'
import classNames from 'classnames'
import { DetailsHTMLAttributes } from 'react'
import { LogOut } from 'react-feather'

export default function LogoutButton(
  props: DetailsHTMLAttributes<HTMLButtonElement> & { disabled?: boolean },
) {
  return (
    <Form method='post' action='/auth/logout'>
      <button
        {...props}
        className={classNames(
          'btn btn-sm btn-error !min-w-[7rem]',
          props.className,
        )}
      >
        Logout <LogOut size={16} />
      </button>
    </Form>
  )
}
