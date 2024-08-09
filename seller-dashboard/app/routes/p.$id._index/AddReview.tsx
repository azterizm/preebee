import { useFetcher } from '@remix-run/react'
import { useState } from 'react'
import MultiplePhotosInput, {
  MultiplePhotosInputEntity,
} from '~/components/MultiplePhotosInput'
import RatingInput from '~/components/RatingInput'

export default function AddReview(props: {
  disabled?: boolean
}) {
  const [photos, setPhotos] = useState<MultiplePhotosInputEntity[]>([])
  const fetcher = useFetcher<{ error?: string; action: string }>()
  function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    photos.forEach((photo) => {
      form.append('image', photo.file)
    })
    form.append('action', 'add_review')
    fetcher.submit(form, { method: 'post', encType: 'multipart/form-data' })
  }

  if (
    !fetcher.data?.error && fetcher.data?.action === 'add_review'
  ) {
    return (
      <div className='bg-white p-4 rounded-lg'>
        <h1 className='text-lg font-bold'>Done!</h1>
        <p>
          Your review has successfully been submitted.
        </p>
      </div>
    )
  }

  if (props.disabled) {
    return (
      <div className='bg-white p-4 rounded-lg'>
        <h1 className='text-lg font-bold'>Well...</h1>
        <p>
          You have already submitted a review previously.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='bg-white p-4 rounded-lg space-y-2'
    >
      <p className='font-bold text-lg'>Write a review</p>
      <MultiplePhotosInput
        value={photos}
        onRemoveByIndex={(index) => {
          setPhotos((prev) => prev.filter((_, i) => i !== index))
        }}
        onAdd={(photos) => {
          setPhotos((prev) => [...prev, ...photos])
        }}
      />
      <div className='form-control'>
        <label htmlFor='name' className='label'>
          <span className='label-text'>Name</span>
        </label>
        <input type='text' className='input input-bordered' name='name' />
      </div>
      <div className='form-control'>
        <label htmlFor='message' className='label'>
          <span className='label-text'>Message</span>
        </label>
        <textarea
          className='textarea textarea-bordered'
          required
          name='message'
          rows={3}
        />
      </div>

      <div className='form-control'>
        <label htmlFor='rating' className='label'>
          <span className='label-text'>Rating</span>
        </label>
        <RatingInput />
      </div>

      <button
        disabled={fetcher.state !== 'idle'}
        className='btn btn-primary !mt-4'
      >
        Submit
      </button>
    </form>
  )
}
