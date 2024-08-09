import Carousel from '~/components/Carousel'
import { useProductStore } from './state'
import classNames from 'classnames'
import { formatNumber } from '~/utils/ui'
import { defaultImages } from './constants'

export default function ProductPreview() {
  const input = useProductStore()
  return (
    <div className='p-4'>
      <div className='grid grid-cols-6'>
        <Carousel
          photos={!input.photos.length
            ? defaultImages.slice(0,1)
            : input.photos.map((r) => r.preview)}
        />
        <div className='p-4 col-span-2'>
          <p className='text-3xl font-bold'>{input.title || 'Title'}</p>
          <span
            className={classNames(
              'badge',
              input.stock <= 0 ? 'badge-error' : 'badge-success',
            )}
          >
            {input.stock > 0 ? input.stock + ' in stock' : 'out of stock'}
          </span>
          <p className='mt-8 text-2xl font-semibold'>
            Rs. {formatNumber(input.price)}{' '}
            <span className='text-sm font-medium'>per item</span>
          </p>
          {input.description
            ? (
              <div className='mt-4'>
                <p className='text-lg font-semibold'>Description</p>
                <p className='font-medium'>{input.description}</p>
              </div>
            )
            : null}
        </div>
      </div>
    </div>
  )
}
