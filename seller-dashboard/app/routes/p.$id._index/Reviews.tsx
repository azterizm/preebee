import { Review, ReviewImage } from '@prisma/client'
import Rating from '~/components/Rating'
import AddReview from './AddReview'
import moment from 'moment'
import { useFetcher } from '@remix-run/react'

export default function Reviews(props: {
  product: {
    title: string
    id: string
    shop: {
      address: string | null
      title: string
      color: string
      id: string
      phone: string | null
      logoFileName: string | null
    }
    price: number
    stockAvailable: number
    description: string | null
    averageReview: number
    reviews: (Review & { images: ReviewImage[] })[]
  }
  userReviews: { id: string }[]
  onSelect: (id: string) => void
  disabled: boolean
}) {
  const fetcher = useFetcher<{ error?: string }>()
  return (
    <div className='mt-8 w-4/6'>
      <h1 className='text-2xl font-bold'>Reviews</h1>
      <Rating
        name={props.product.id + '_rating'}
        value={props.product.averageReview}
        className='mt-4 mb-2'
      />
      <p className='text-sm font-medium'>
        {props.product.reviews.length}{' '}
        rating{props.product.reviews.length > 1 ? 's' : ''}
      </p>
      <div className='my-6 space-y-4'>
        <AddReview disabled={props.disabled} />

        {props.product.reviews.map((r) => {
          const isUserReview = props.userReviews.find((v) => v.id === r.id)
          return (
            <div key={r.id} className='bg-white p-4 rounded-lg'>
              <div className='flex items-center gap-4 justify-between'>
                <div className='flex items-center gap-2'>
                  <Rating
                    className='-ml-3'
                    value={r.stars}
                  />
                  <p>
                    {r.name} {isUserReview
                      ? <span className='font-medium text-error'>(You)</span>
                      : null}
                  </p>
                </div>
                <p>{moment(r.createdAt).toNow()}</p>
              </div>
              <p className='my-2'>
                {r.message}
              </p>
              <div className='flex items-center gap-2 overflow-x-auto snap-x snap-mandatory py-2'>
                {r.images.map((r) => (
                  <img
                    src={`/api/review/image/${r.id}`}
                    alt={r.id}
                    className='w-32 aspect-square object-cover object-center rounded-lg snap-center'
                    onClick={() => props.onSelect(r.id)}
                    key={r.id}
                  />
                ))}
              </div>
              {isUserReview
                ? (
                  <fetcher.Form method='post'>
                    <button
                      disabled={fetcher.state !== 'idle'}
                      className='btn btn-error'
                    >
                      Delete
                    </button>
                    <input type='hidden' name='id' value={r.id} />
                    <input type='hidden' name='action' value='delete_review' />
                  </fetcher.Form>
                )
                : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
