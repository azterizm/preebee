import Confetti from 'react-confetti'
import { useFetcher, useRevalidator } from '@remix-run/react'
import { serialize } from 'object-to-formdata'
import { useEffect, useRef, useState } from 'react'
import { useWindowSize } from '@uidotdev/usehooks'

export default function FirstProductDialog(props: {
  shippingFee?: number
}) {
  const { width, height } = useWindowSize()
  const ref = useRef<HTMLDialogElement>(null)
  const [input, setInput] = useState<number>(props.shippingFee || 0)
  const fetcher = useFetcher()
  const revalidator = useRevalidator()

  useEffect(() => {
    setTimeout(() => {
      ref.current?.showModal()
    }, 250)
  }, [])

  function onSubmit() {
    fetcher.submit(
      serialize({ value: input, action: 'update_shipping_fees' }),
      { method: 'post' },
    )
    revalidator.revalidate()
    ref.current?.close()
  }
  function onClose() {
    ref.current?.close()
    fetcher.submit(
      serialize({ action: 'clear_message' }),
      { method: 'post' },
    )
  }

  return (
    <dialog ref={ref} id='shipping_modal' className='modal'>
      <div className='modal-box'>
        <h3 className='text-center font-bold text-4xl'>
          It's your first product!
        </h3>
        <p className='text-center mt-4 max-w-sm mx-auto'>
          Congratulations! You have added your first product. Now, let's set up
          the shipping fees.
        </p>
        <p className='mt-8 mb-4'>
          How much do you want to charge for shipping?
        </p>
        <label className='input input-bordered flex items-center gap-2'>
          Rs.{' '}
          <input
            className='grow'
            placeholder='Type your fees here...'
            type='number'
            name='value'
            value={Number(input).toString()}
            onChange={(e) => setInput(Number(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          />
        </label>
        <div className='modal-action'>
          <button
            onClick={onClose}
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

      <Confetti
        recycle={false}
        gravity={0.05}
        width={width || 0}
        height={height || 0}
      />
    </dialog>
  )
}
