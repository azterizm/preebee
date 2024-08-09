import classNames from 'classnames'

export default function Logo(
  props: {} & React.HTMLAttributes<HTMLImageElement>,
) {
  return (
    <p
      {...props}
      className={classNames(
        'select-none text-3xl font-serif font-bold',
        props.className,
      )}
    >
      Preebee
    </p>
  )
}
