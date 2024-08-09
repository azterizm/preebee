import { useState } from "react"
import { Eye, EyeOff } from "react-feather"

export default function PasswordInput(props: {
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <label className="input input-bordered flex items-center gap-2">
      <input name='password' required type={show ? 'text' : 'password'} className="grow" placeholder={props.placeholder} autoComplete="current-password webauthn" />
      <button onClick={() => setShow(e => !e)} type='button' className="btn btn-ghost translate-x-6 no-animation ">
        {show ? <EyeOff /> : <Eye />}
      </button>
    </label>
  )
}
