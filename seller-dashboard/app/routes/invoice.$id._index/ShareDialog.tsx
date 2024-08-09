import _ from 'lodash'
import { useRef } from 'react'
import socialMedia from '~/constants/social_media'

export default function ShareDialog(props: {
  phoneNumber: string
}) {
  const ref = useRef<HTMLDialogElement>(null)

  function onShare(platform: string) {
    switch (platform) {
      case 'Facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
          '_blank',
        )
        break
      case 'Twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${window.location.href}`,
          '_blank',
        )
        break
      case 'WhatsApp':
        window.open(
          `https://wa.me/?text=${window.location.href}`,
          '_blank',
        )
        break
      default:
        break
    }
  }

  return (
    <dialog ref={ref} id='share_modal' className='modal'>
      <div className='modal-box'>
        <h3 className='font-bold text-lg mb-4'>Accessing this Invoice</h3>
        <p className='mb-2'>
          To access this invoice later, you can use the following link:
        </p>
        <div className='mockup-browser border border-base-300'>
          <div className='mockup-browser-toolbar'>
            <div className='input border border-base-300'>
              {typeof window === 'undefined'
                ? ''
                : window.location.href.split('/').slice(2).join('/')}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                document.getElementById('copy_button')!.textContent = 'Copied!'
                _.delay(() => {
                  document.getElementById('copy_button')!.textContent = 'Copy'
                }, 1500)
              }}
              id='copy_button'
              className='ml-2 btn btn-sm btn-primary'
            >
              Copy
            </button>
          </div>
          <div className='flex justify-center px-4 py-16 border-t border-base-300'>
            <div className='form-control'>
              <label htmlFor='password' className='label'>
                <span className='label-text'>Phone number (password)</span>
              </label>
              <input
                type='text'
                className='input input-bordered pointer-events-none'
                name='password'
                defaultValue={props.phoneNumber}
              />
            </div>
          </div>
        </div>

        <div className='my-8'>
          <h2 className='text-lg font-bold'>Share</h2>
          <p>
            It would better if you share this invoice with your friends and
            family.
          </p>

          <div className='flex items-center gap-4 flex-wrap my-4'>
            {socialMedia.filter((r) =>
              ['Facebook', 'Twitter', 'WhatsApp']
                .includes(r.name)
            )
              .map((r, i) => (
                <button
                  onClick={() => onShare(r.name)}
                  key={i}
                  className='btn text-white hover:bg-opacity-80 hover:brightness-90 flex items-center gap-2'
                  style={{ backgroundColor: r.color }}
                >
                  {r.logo}
                  {r.name}
                </button>
              ))}
          </div>
        </div>

        <div className='modal-action'>
          <button
            onClick={() => ref.current?.close()}
            className='btn btn-primary'
          >
            Got it!
          </button>
        </div>
      </div>
    </dialog>
  )
}
