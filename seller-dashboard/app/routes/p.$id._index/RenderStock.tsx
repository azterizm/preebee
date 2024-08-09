import classNames from 'classnames'
import React from 'react'

export default function RenderStock(props: {
  value: number
}) {
  return (
    <span
      className={classNames(
        'badge',
        props.value <= 0
          ? 'badge-error'
          : props.value === 1
            ? 'badge-warning'
            : 'badge-success',
      )}
    >
      {props.value === 1 ? 'only ' : ''}
      {props.value > 0
        ? props.value + ' in stock'
        : 'out of stock'}
    </span>
  )

}
