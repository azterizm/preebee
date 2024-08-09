import classNames from 'classnames'

export default function RenderStatusTableData(props: {
  status: string
  message?: string | null
  showNewLabel?: boolean
}) {
  return (
    <td
      className={classNames(getTextColorClassNameByStatus(props.status))}
    >
      {getStatusLabel(props.status, props.message)}{' '}{props.showNewLabel ? (
        <span className="ml-1 badge-sm badge badge-error">New!</span>
      ) : null}
    </td>
  )
}

export function getStatusLabel(arg: string, message?: string | null) {
  return arg === 'PENDING'
    ? 'Preparing...'
    : arg === 'PROCESSING'
      ? 'Shipped'
      : arg === 'COMPLETED'
        ? 'Delivered'
        : arg === 'CANCELLED'
          ? 'Cancelled' + (message ? '. Message from seller: ' + message : '')
          : 'Product are being prepared'
}

export function getTextColorClassNameByStatus(arg: string) {
  return arg === 'PENDING'
    ? 'text-yellow-500'
    : arg === 'PROCESSING'
      ? 'text-primary'
      : arg === 'COMPLETED'
        ? 'text-success'
        : arg === 'CANCELLED'
          ? 'text-error'
          : 'text-warning'
}
