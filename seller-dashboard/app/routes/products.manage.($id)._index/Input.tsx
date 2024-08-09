import { useFetcher, useParams } from '@remix-run/react'
import { serialize } from 'object-to-formdata'
import { useState } from 'react'
import { Plus } from 'react-feather'
import MultiplePhotosInput from '~/components/MultiplePhotosInput'
import { useWindowSize } from '~/hooks/ui'
import AddCategoryModal from './AddCategory'
import { useProductStore } from './state'

export default function ProductsAddInput(props: {
  categories: { id: string; name: string }[]
  productImages: {
    id: string
    fileName: string
    fileSize: number
    fileType: string
  }[]
}) {
  const input = useProductStore()
  const fetcher = useFetcher<{ error?: string }>()
  const {width} = useWindowSize()
  const { id } = useParams()
  const [removedAvailablePhotosId, setRemovedAvailablePhotosId] = useState<
    string[]
  >([])
  function onRemove(id: string) {
    fetcher.submit(serialize({ id }), {
      action: '/api/category/remove',
      method: 'post',
    })
  }
  function onRemovePhotoByIndex(index: number) {
    input.removePhotoByIndex(index)
    if (id && props.productImages.length) {
      setRemovedAvailablePhotosId([
        ...removedAvailablePhotosId,
        props.productImages[index].id,
      ])
    }
  }
  return (
    <div className='space-y-4 overflow-y-auto h-full pl-4 pr-0 sm:pr-2 my-4 flex-1 sm:pl-2 pb-48 sm:pb-0' style={{ maxWidth: width < 640 ? `calc(100vw - 1rem)` : '100%' }}>
      <MultiplePhotosInput
        value={input.photos}
        onRemoveByIndex={onRemovePhotoByIndex}
        onAdd={input.addPhotos}
      />

      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Title</span>
        </label>
        <input
          type='text'
          className='input input-bordered'
          value={input.title}
          onChange={(e) => input.changeSetting('title', e.target.value)}
          name='title'
          required
        />
      </div>

      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Price</span>
        </label>
        <label className='input input-bordered flex items-center gap-2'>
          <span className='badge badge-success'>Rs.</span>
          <input
            type='number'
            name='price'
            className='grow'
            placeholder='Add your price'
            min='10'
            max='200000'
            value={input.price}
            onChange={(e) => input.changeSetting('price', e.target.value)}
          />
        </label>
      </div>

      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Description (optional)</span>
        </label>
        <textarea
          value={input.description}
          onChange={(e) => input.changeSetting('description', e.target.value)}
          rows={3}
          className='textarea textarea-bordered'
          name='description'
        />
      </div>

      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Stock</span>
        </label>
        <input
          placeholder='How many of these do you have?'
          type='number'
          className='input input-bordered'
          value={input.stock}
          onChange={(e) => input.changeSetting('stock', e.target.value)}
          min={0}
          max={1000}
          name='stock'
          required
        />
        <label className='label'>
          <span className='label-text-alt'>
            Each purchase will reduce the stock by 1
          </span>
        </label>
      </div>

      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Category</span>
        </label>
        {props.categories.map((r, i) => (
          <div key={i} className='form-control'>
            <label className='label cursor-pointer'>
              <span className='text-xs label-text'>{r.name}</span>
              <div className='flex items-center gap-4'>
                <input
                  type='checkbox'
                  name='category'
                  value={r.id}
                  className='checkbox checkbox-primary'
                  checked={input.categoriesId.includes(r.id)}
                  onChange={(e) => {
                    e.target.checked
                      ? input.addCategory(r.id)
                      : input.removeCategoryById(r.id)
                  }}
                />
                <button
                  disabled={fetcher.state !== 'idle'}
                  onClick={() => onRemove(r.id)}
                  className='btn btn-sm btn-error'
                  type='button'
                >
                  Remove
                </button>
              </div>
            </label>
          </div>
        ))}
        <button
          onClick={() =>
            (document as any).getElementById('add_category_modal')
              ?.showModal()}
          className='w-full btn btn-secondary'
          type='button'
        >
          Add new category <Plus size={16} />
        </button>
      </div>

      <AddCategoryModal />
      {!id
        ? null
        : removedAvailablePhotosId.map((r, i) => (
          <input type='hidden' name='removed_images_id' value={r} key={i} />
        ))}
    </div>
  )
}
