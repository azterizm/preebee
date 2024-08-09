import { useFetcher } from '@remix-run/react'
import { serialize } from 'object-to-formdata'
import { useEffect, useRef, useState } from 'react'

export default function ShippingDialog(props: {
  defaultValue?: number
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [input, setInput] = useState<number>(props.defaultValue || 0)
  const fetcher = useFetcher()

  useEffect(() => {
    if (props.defaultValue) setInput(props.defaultValue)
  }, [props.defaultValue])

  function onSubmit() {
    fetcher.submit(
      serialize({ value: input, action: 'update_shipping_fees' }),
      { method: 'post' },
    )
    ref.current?.close()
  }

  return (
    <dialog ref={ref} id='shipping_modal' className='modal'>
      <div className='modal-box'>
        <h3 className='font-bold text-lg'>Change Shipping Fees</h3>
        <p className='mb-4'>
          How much do you want to charge for shipping?
        </p>
        <label className='input input-bordered flex items-center gap-2'>
          Rs.{' '}
          <input
            className='grow'
            placeholder='Type your fees here...'
            type='number'
            name='value'
            id='shipping_charge_input'
            value={Number(input).toString()}
            onChange={(e) => setInput(Number(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          />
        </label>
        <div className='modal-action'>
          <button
            onClick={() => ref.current?.close()}
            className='btn'
            disabled={fetcher.state !== 'idle'}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={fetcher.state !== 'idle'}
            className='btn btn-primary min-w-24'
          >
            Save
          </button>
        </div>
      </div>
    </dialog>
  )
}
