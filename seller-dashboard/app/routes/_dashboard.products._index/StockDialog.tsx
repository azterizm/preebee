import { useFetcher } from '@remix-run/react'
import { serialize } from 'object-to-formdata'
import { useEffect, useRef, useState } from 'react'

export default function StockDialog(props: {
  info: {
    stock: number
    id: string
    title: string
  } | null
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [input, setInput] = useState<number>(0)
  const fetcher = useFetcher()

  useEffect(() => {
    setInput(props.info?.stock || 0)
  }, [props.info])

  function onSubmit() {
    fetcher.submit(
      serialize({ id: props.info?.id, stock: input, action: 'change_stock' }),
      { method: 'post' },
    )
    ref.current?.close()
  }

  return (
    <dialog ref={ref} id='stock_modal' className='modal'>
      <div className='modal-box'>
        <h3 className='font-bold text-lg'>Change Stock</h3>
          <p className='mb-4'>
            How many of <b>{props.info?.title}</b> do you want to sell?
          </p>
          <input
            className='input input-bordered'
            type='number'
            value={Number(input).toString()}
            onChange={(e) => setInput(Number(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          />
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
