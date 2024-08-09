export default function MultiplePhotosInput(props: {
  value: {
    file: File
    preview: string
  }[]
  onRemoveByIndex: (index: number) => void
  onAdd: (files: MultiplePhotosInputEntity[]) => void
}) {
  function onChangeFilesInput(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = e.target.files
    if (!files?.length) return
    props.onAdd(
      Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    )
  }
  return (
    <div className='form-control'>
      <label className='label'>
        <span className='label-text'>
          Photos{props.value.length ? ' (click to remove)' : ''}
        </span>
      </label>
      <div className='flex items-center gap-4 flex-wrap overflow-hidden'>
        {props.value.map((r, i) => (
          <button
            key={i}
            className='btn overflow-hidden hover:btn-error w-32 h-32'
            type='button'
            onClick={() => props.onRemoveByIndex(i)}
          >
            <img
              src={r.preview}
              alt='preview image'
              className='h-32 w-32 object-contain object-center overflow-hidden'
            />
          </button>
        ))}
      </div>
      <input
        onChange={onChangeFilesInput}
        type='file'
        multiple
        accept='image/*'
        className='file-input file-input-bordered'
      />
    </div>
  )
}

export interface MultiplePhotosInputEntity {
  file: File
  preview: string
}
