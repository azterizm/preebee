export default function ImagePreview(props: {
  selectedReviewId: string | null
  onClose: () => void
}) {
  if (!props.selectedReviewId) return null
  return (
    <div
      onClick={props.onClose}
      className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50'
    >
      <img
        src={`/api/review/image/${props.selectedReviewId}`}
        alt='test'
        className='object-contain w-full h-full'
      />
    </div>
  )
}
