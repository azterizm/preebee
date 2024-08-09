import classNames from 'classnames'

export default function Rating(props: {
  value: number
  name?: string
  isSelectable?: boolean
  isLarge?: boolean
  className?: string
}) {
  return (
    <div
      className={classNames('rating rating-half', {
        'rating-lg': props.isLarge,
        '-translate-x-2': !props.isSelectable,
      }, props.className)}
    >
      <input
        type='radio'
        name={props.name || 'rating'}
        className='rating-hidden'
        defaultChecked={props.value <= 0}
      />
      {new Array(10).fill(0).map((_, i) => (
        <input
          key={i}
          type='radio'
          name={props.name || 'rating'}
          className={`bg-yellow-500 mask mask-star-2 mask-half-${i % 2 + 1}`} //mask-half-1 or mask-half-2
          defaultChecked={props.value > i / 2}
          disabled={!props.isSelectable}
        />
      ))}
    </div>
  )
}
