import { useRef } from 'react'
import socialMedia from '~/constants/social_media'
import { useSettingsStore } from './state'

export default function SocialMedia() {
  const containerRef = useRef<HTMLDialogElement>(null)
  const socialMediaUsed = useSettingsStore((e) => e.socialMedia)
  const socialMediaUsedNames = socialMediaUsed.map((e) => e.name)
  const addSocialMedia = useSettingsStore((e) => e.addSocialMedia)
  return (
    <dialog ref={containerRef} id='social_media_modal' className='modal'>
      <div className='modal-box'>
        <h3 className='font-bold text-lg'>Add Social Media</h3>
        <p className='py-4'>Pick any platform from below.</p>
        <div className='flex items-center gap-4 flex-wrap'>
          {socialMedia.filter((r) => !socialMediaUsedNames.includes(r.name))
            .map((r, i) => (
              <button
                onClick={() => (
                  addSocialMedia(r.name, ''), containerRef.current?.close()
                )}
                key={i}
                className='btn text-white hover:bg-opacity-80 hover:brightness-90 flex items-center gap-2'
                style={{ backgroundColor: r.color }}
              >
                {r.logo}
                {r.name}
              </button>
            ))}
        </div>
        <div className='modal-action'>
          <button
            onClick={() => containerRef.current?.close()}
            className='btn btn-neutral'
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  )
}
