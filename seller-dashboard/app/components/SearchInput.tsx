import classNames from 'classnames'
import React from 'react'
import { Search } from 'react-feather'

export default function SearchInput(props: {
  containerClassName?: string
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
  return (
    <label className={classNames('input input-bordered flex items-center gap-2', props.containerClassName)}>
      <Search size={16} />
      <input type='text' placeholder='Search' {...props} className={classNames('grow', props.className)} />
    </label>
  )
}
