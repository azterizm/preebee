import classNames from 'classnames'
import Cart from './Cart'

export default function Header({ product, aboutModalRef, ...props }: {
  product: {
    shop: {
      logoFileName?: string | null
      title: string
      color: string
      id: string
    }
  }
  aboutModalRef: React.RefObject<HTMLDialogElement>
  cart: {
    id: string
    title: string
    price: number
    images: {
      id: string
    }[]
    quantity: number
  }[]
}) {
  return (
    <div className='flex items-center justify-between gap-4'>
      <div className='flex items-center space-x-4'>
        {product.shop.logoFileName
          ? <img className='w-16 rounded-lg' src={`/api/logo/${product.shop.id}`} alt='' />
          : null}
        <p className='text-xl font-semibold'>{product.shop.title}</p>
      </div>

      <div className='flex items-center justify-end gap-4'>
        <button
          className={classNames(
            'btn text-neutral-content',
            `bg-${product.shop.color}-600 hover:bg-${product.shop.color}-700`,
          )}
          onClick={() => aboutModalRef.current?.showModal()}
        >
          About
        </button>
        <Cart data={props.cart} />
      </div>
    </div>
  )
}
