import classNames from 'classnames'

export default function PhoneNumberInput(props: {
  value: string
  onChange: (e: string) => void
  label?: string
  name?: string
  inputClassName?: string
  required?: boolean
}) {
  function onChangePhoneNumberInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    if (
      v.match(new RegExp('^[0-9]*$', 'g')) &&
      (v[0] === '0'
        ? v.length <= 11
        : v[0] === '+'
        ? v.length <= 13
        : v.length <= 12)
    ) {
      props.onChange(v)
    }
  }
  return (
    <div className='form-control'>
      <label className='label'>
        <span className='label-text'>{props.label || 'Contact number'}</span>
      </label>
      <input
        name={props.name || 'phone'}
        type='text'
        className={classNames('input input-bordered', props.inputClassName)}
        value={props.value}
        onChange={onChangePhoneNumberInput}
        placeholder='03123456789'
        required={props.required}
        minLength={props.required ? 11 : undefined}
      />
    </div>
  )
}

