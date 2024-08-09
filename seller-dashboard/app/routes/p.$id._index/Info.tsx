import { useFetcher } from '@remix-run/react'
import { serialize } from 'object-to-formdata'
import { useEffect, useState } from 'react'
import { Minus, Plus } from 'react-feather'
import { formatNumber } from '~/utils/ui'
import RenderStock from './RenderStock'

export default function Info({ product, isOwner }: {
  isOwner: boolean
  product: {
    id: string
    title: string
    price: number
    description?: string | null
    stockAvailable: number
    images: { id: string }[]
  }
}) {
  const [quantity, setQuantity] = useState(1)
  const fetcher = useFetcher<{ error?: null | string; action: string }>()

  useEffect(() => {
    if (
      fetcher.data?.action === 'add_to_cart' && !fetcher.data.error &&
      fetcher.state === 'idle'
    ) {
      setQuantity(1)
      const el = document.getElementById('cart-panel') as HTMLInputElement
      if (el) el.checked = true
    }
  }, [fetcher])

  function onAddToCart(checkout = false) {
    fetcher.submit(
      serialize({ action: 'add_to_cart', id: product.id, quantity, checkout }),
      { method: 'post', action: '/p' },
    )
  }

  return (
    <div className='col-span-2 ml-8 mt-8 xl:mt-0'>
      <p className='text-3xl font-bold'>{product.title}</p>
      <RenderStock value={product.stockAvailable} />
      <p className='mt-8 text-2xl font-semibold'>
        Rs. {formatNumber(product.price)}{' '}
        <span className='text-sm font-medium'>per item</span>
      </p>
      {product.description
        ? (
          <div className='mt-4'>
            <p className='text-lg font-semibold'>Description</p>
            <p className='font-medium'>{product.description}</p>
          </div>
        )
        : null}
      <div className='form-control my-4'>
        <label htmlFor='quantity' className='label'>
          <span className='label-text'>Quantity</span>
        </label>
        <div className='flex items-center gap-2'>
          <button
            onClick={() =>
              setQuantity(
                Math.min(product.stockAvailable, quantity + 1),
              )}
            className='btn btn-sm btn-circle btn-primary'
          >
            <Plus />
          </button>
          <input
            type='number'
            name='quantity'
            id='quantity'
            className='input input-bordered w-max'
            min={1}
            max={product.stockAvailable}
            disabled={product.stockAvailable <= 0}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />
          <button
            onClick={() =>
              setQuantity(
                Math.max(1, quantity - 1),
              )}
            className='btn btn-sm btn-circle btn-primary'
          >
            <Minus />
          </button>
        </div>
      </div>

      <div className='my-4 flex'>
        <button
          disabled={product.stockAvailable <= 0 || fetcher.state !== 'idle' || isOwner}
          className='btn flex-1 btn-primary whitespace-nowrap'
          onClick={() => onAddToCart(true)}
        >
          Buy Now
        </button>
        <button
          disabled={product.stockAvailable <= 0 || fetcher.state !== 'idle' || isOwner}
          onClick={() => onAddToCart(false)}
          className='btn flex-1 btn-secondary ml-4 whitespace-nowrap'
        >
          Add to Cart
        </button>
      </div>
      {(fetcher.data?.action === 'add_to_cart' && fetcher.data.error)
        ? <div className='alert alert-error'>{fetcher.data.error}</div>
        : null}
    </div>
  )
}
