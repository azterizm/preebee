import { Link, useFetcher } from '@remix-run/react'
import { ChevronRight } from 'react-feather'
import Rating from '~/components/Rating'
import { formatNumber } from '~/utils/ui'
import { type Product } from '.'
import RenderStock from '../p.$id._index/RenderStock'
import { serialize } from 'object-to-formdata'

export default function Product(props: Product) {
  const fetcher = useFetcher()
  function onAddToCart(id: string) {
    fetcher.submit(
      serialize({ action: 'add_to_cart', id: id, quantity: 1 }),
      { method: 'post', action: '/p' },
    )
  }
  const to = !import.meta.env.PROD ? `/p/${props.id}` : `https://${props.shopId}.preebee.com/p/${props.id}`
  return (
    <div
      className='card w-[20rem] bg-white/70 shadow-xl '
    >
      <figure>
        <Link to={to} prefetch='viewport'>
          <img
            loading='lazy'
            src={`/api/product_image/${props.images[0].id}`}
            alt={props.title}
          />
        </Link>
      </figure>
      <div className='card-body'>
        <Link
          prefetch='intent'
          to={to}
          className='card-title'
        >
          {props.title}
        </Link>
        <div className='flex justify-between items-center'>
          <p className='text-xl font-bold text-primary'>
            Rs. {formatNumber(props.price)}
          </p>
          <RenderStock value={props.stockAvailable} />
        </div>
        <Rating
          name={props.id + '_rating'}
          value={props.averageReview}
          className='mt-2 mb-4'
        />

        {props.shopId ? null : (
          <div className='flex items-center gap-4 w-full'>
            <button
              disabled={!props.stockAvailable}
              className='flex-1 btn btn-primary'>
              Buy Now
            </button>
            <button
              disabled={!props.stockAvailable}
              onClick={() => onAddToCart(props.id)}
              className='btn flex-1 btn-secondary'
            >
              Add To Cart
            </button>
          </div>
        )}
        <Link
          prefetch='intent'
          to={to}
          className='btn btn-primary w-full mt-2'
        >
          Show More <ChevronRight size={16} />
        </Link>
        {props.shopId ? (
          <Link
            prefetch='intent'
            to={`https://${props.shopId}.preebee.com/p`}
            className='btn btn-primary w-full mt-2'
          >
            Visit Shop <ChevronRight size={16} />
          </Link>
        ) : null}
      </div>
    </div>
  )
}
