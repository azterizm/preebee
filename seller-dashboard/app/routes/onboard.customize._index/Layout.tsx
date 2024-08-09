import classNames from 'classnames'

export default function Layout(props: {
  selected: number
  onChange: (value: number) => void
}) {
  return (
    <div className='form-control'>
      <label className='label'>
        <span className='label-text'>Layout</span>
      </label>
      <div className='flex items-center flex-wrap justify-start gap-4'>
        <button
          onClick={() => props.onChange(0)}
          className={classNames(
            'p-6 rounded-lg flex flex-col justify-center items-center cursor-pointer block',
            props.selected === 0
              ? 'bg-neutral-400'
              : 'bg-neutral-300 hover:bg-neutral-400',
          )}
        >
          <div className='w-16 h-8 bg-neutral rounded-lg' />
          <div className='flex items-center space-x-4 mt-2'>
            <div className='w-4 h-4 rounded-lg bg-neutral' />
            <div className='w-4 h-4 rounded-lg bg-neutral' />
            <div className='w-4 h-4 rounded-lg bg-neutral' />
          </div>
        </button>
        <button
          onClick={() => props.onChange(1)}
          className={classNames(
            'p-6 rounded-lg flex gap-2 justify-center items-center cursor-pointer block',
            props.selected === 1
              ? 'bg-neutral-400'
              : 'bg-neutral-300 hover:bg-neutral-400',
          )}
        >
          <div className='w-16 h-8 bg-neutral rounded-lg' />
          <div className='flex items-center space-y-2 flex-col'>
            <div className='w-4 h-4 rounded-lg bg-neutral' />
            <div className='w-4 h-4 rounded-lg bg-neutral' />
            <div className='w-4 h-4 rounded-lg bg-neutral' />
          </div>
        </button>
        <button
          onClick={() => props.onChange(2)}
          className={classNames(
            'p-6 rounded-lg flex flex-col justify-center items-center cursor-pointer block',
            props.selected === 2
              ? 'bg-neutral-400'
              : 'bg-neutral-300 hover:bg-neutral-400',
          )}
        >
          <div className='flex items-center space-x-4 mb-2'>
            <div className='w-4 h-4 rounded-lg bg-neutral' />
            <div className='w-4 h-4 rounded-lg bg-neutral' />
            <div className='w-4 h-4 rounded-lg bg-neutral' />
          </div>
          <div className='w-16 h-8 bg-neutral rounded-lg' />
        </button>
        <button
          onClick={() => props.onChange(3)}
          className={classNames(
            'p-6 rounded-lg flex gap-2 justify-center items-center cursor-pointer block',
            props.selected === 3
              ? 'bg-neutral-400'
              : 'bg-neutral-300 hover:bg-neutral-400',
          )}
        >
          <div className='flex items-center space-y-2 flex-col'>
            <div className='w-4 h-4 rounded-lg bg-neutral' />
            <div className='w-4 h-4 rounded-lg bg-neutral' />
            <div className='w-4 h-4 rounded-lg bg-neutral' />
          </div>
          <div className='w-16 h-8 bg-neutral rounded-lg' />
        </button>
      </div>
    </div>
  )
}
