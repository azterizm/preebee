import { useState } from 'react'

export default function RatingInput(props: {
  name?: string
  value?: number
}) {
  const [value, setValue] = useState(props.value || 0)
  return (
    <div className='rating'>
      {new Array(5).fill(null).map((_, i) => (
        <input
          key={i}
          type='radio'
          name={props.name || 'rating'}
          id={`${props.name || 'rating'}-${i}`}
          className='mask mask-star-2 bg-orange-400'
          checked={value > i}
          onChange={() => setValue(i + 1)}
        />
      ))}
      <input type='hidden' name='rating' value={value} />
    </div>
  )
}
