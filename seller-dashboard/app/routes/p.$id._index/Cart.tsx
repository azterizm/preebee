import { Link, useFetcher } from '@remix-run/react'
import classNames from 'classnames'
import { ArrowRight, ShoppingCart, X } from 'react-feather'
import { ClientOnly } from 'remix-utils/client-only'
import { formatNumber } from '~/utils/ui'

export default function Cart(props: {
  data: {
    id: string
    title: string
    price: number
    images: {
      id: string
    }[]
    quantity: number
  }[]
}) {
  const fetcher = useFetcher()
  return (
    <ClientOnly fallback={null}>
      {() => (
        <div className='drawer z-20 drawer-end w-auto'>
          <input
            id='cart-panel'
            type='checkbox'
            className='drawer-toggle'
          />
          <div className='drawer-content'>
            <label
              htmlFor='cart-panel'
              className='btn btn-secondary drawer-button'
            >
              Cart
              <ShoppingCart size={16} />
              {props.data.length > 0
                ? <span className='badge badge-error'>{props.data.length}</span>
                : null}
            </label>
          </div>
          <div className='drawer-side'>
            <label
              htmlFor='cart-panel'
              aria-label='close sidebar'
              className='drawer-overlay'
            >
            </label>
            <div className='flex flex-col p-4 w-80 h-screen bg-base-200 text-base-content space-y-4 divide-y-2'>
              <div className='flex items-center justify-between gap-2'>
                <p className='text-lg font-semibold'>Cart</p>
                {props.data.length > 0
                  ? (
                    <fetcher.Form action='/p' method='post'>
                      <button
                        name='action'
                        value='clear_cart'
                        className='btn btn-sm btn-error'
                        disabled={props.data.length === 0 ||
                          fetcher.state !== 'idle'}
                      >
                        Clear
                      </button>
                    </fetcher.Form>
                  )
                  : null}
              </div>
              {!props.data.length
                ? (
                  <div className='flex-1 flex items-center justify-center'>
                    <p className='text-center text-lg font-medium flex-1 px-4'>
                      Your cart is empty. Go ahead and click "Add to cart"!
                    </p>
                  </div>
                )
                : (
                  <div className='flex-1 overflow-y-auto pr-4'>
                    {props.data.map((r) => (
                      <div key={r.id} className='py-4 relative'>
                        <div className='flex items-start gap-4'>
                          <img
                            src={`/api/product_image/${r.images[0].id}`}
                            alt='product image'
                            className='w-16 rounded-lg'
                          />

                          <p>{r.title}</p>
                        </div>
                        <div className='flex items-center justify-between mt-2 text-sm'>
                          <p>Quantity: {r.quantity}</p>
                          <p>Rs. {formatNumber(r.price)}</p>
                        </div>
                        <fetcher.Form
                          className='tooltip absolute tooltip-left tooltip-error top-2 right-0'
                          data-tip='Remove from cart'
                          method='post'
                          action='/p'
                        >
                          <button
                            disabled={fetcher.state !== 'idle'}
                            name='action'
                            value='remove_from_cart'
                            className='btn btn-circle btn-sm btn-error scale-50 origin-right'
                          >
                            <X />
                          </button>
                          <input type='hidden' name='id' value={r.id} />
                        </fetcher.Form>
                      </div>
                    ))}
                  </div>
                )}

              <div className='flex items-center justify-between gap-2'>
                <Link
                  to='/checkout'
                  className={classNames('btn btn-primary w-full', {
                    'opacity-50 pointer-events-none': !props.data.length,
                  })}
                >
                  Checkout <ArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </ClientOnly>
  )
}
