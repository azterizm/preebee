import { useRevalidator } from '@remix-run/react'
import axios from 'axios'
import { serialize } from 'object-to-formdata'
import { useRef, useState } from 'react'

export default function AddCategoryModal(props: {
  onAdd?: (input: string) => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const revalidator = useRevalidator()
  async function onSubmit() {
    if (!input) return
    setLoading(true)
    await axios.post('/api/category/add', serialize({ input }), {
      withCredentials: true,
    })
    setLoading(false)
    ref.current?.close()
    props.onAdd && props.onAdd(input)
    setInput('')
    revalidator.revalidate()
  }
  return (
    <dialog ref={ref} id='add_category_modal' className='modal'>
      <div className='modal-box'>
        <h3 className='font-bold text-lg'>Add new category</h3>
        <p className='py-4'>
          Please enter the name of the new category you want to add.
        </p>
        <div className='form-control'>
          <label className='label'>
            <span className='label-text'>Category Name</span>
          </label>
          <input
            type='text'
            className='input input-bordered'
            placeholder='E.g. Electronics'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          />
        </div>
        <div className='modal-action'>
          <button
            onClick={onSubmit}
            className='btn min-w-24 btn-secondary'
            disabled={loading}
          >
            Add
          </button>
          <button
            className='btn'
            disabled={loading}
            onClick={() => (
              ref.current?.close(), setInput('')
            )}
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  )
}
