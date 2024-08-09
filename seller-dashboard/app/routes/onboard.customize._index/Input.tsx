import classNames from 'classnames'
import { Plus } from 'react-feather'
import Layout from './Layout'
import SocialMediaModal from './SocialMediaModal'
import { useSettingsStore } from './state'
import socialMedia from '~/constants/social_media'
import { backgroundColorButtonClasses } from './constants'
import PhoneNumberInput from '~/components/PhoneNumberInput'
import { parseShopName } from '~/utils/parse'

export default function Input() {
  const settings = useSettingsStore()
  return (
    <div
      className={classNames(
        'p-4 bg-base-200 rounded-2xl space-y-4',
        settings.showPreview ? 'blur-md' : '',
      )}
    >
      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Name</span>
        </label>
        <input
          value={settings.name}
          onChange={(e) => settings.changeSetting('name', e.target.value)}
          type='text'
          placeholder='Type name here...'
          name='name'
          className='input input-primary'
        />
      </div>
      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Description</span>
        </label>
        <textarea
          value={settings.description}
          onChange={(e) => settings.changeSetting('description', e.target.value)}
          placeholder='Type description here...'
          name='description'
          className='textarea textarea-primary'
        />
      </div>
      <Layout
        selected={settings.layout}
        onChange={(e) => settings.changeSetting('layout', e)}
      />
      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Color</span>
        </label>
        <div className='flex items-center gap-4 flex-wrap'>
          {backgroundColorButtonClasses.map((color, i) => (
            <button
              key={i}
              onClick={() => settings.changeSetting('color', color)}
              className={classNames(
                'btn btn-circle',
                color,
                { 'border-2 border-primary': settings.color === color },
              )}
            >
              {' '}
            </button>
          ))}
        </div>
      </div>
      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Logo (optional)</span>
        </label>
        {settings.logoUrl && (
          <button
            onClick={() => settings.changeSetting('logoUrl', '')}
            className='btn btn-sm btn-error mb-2'
          >
            Remove
          </button>
        )}
        <input
          type='file'
          className='file-input file-input-bordered file-input-primary'
          name='logo'
          accept='image/*'
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (e) =>
                settings.changeSetting('logoUrl', e.target?.result as string)
              reader.readAsDataURL(file)
            }
          }}
        />
      </div>

      <div className='form-control'>
        <label className='label'>
          <span className='label-text'>Social Media links</span>
        </label>
        <div className='space-y-2 mb-2'>
          {settings.socialMedia.map((r, i) => {
            let logo = socialMedia.find((e) => e.name === r.name)?.logo
            if (logo && logo.type === 'img') {
              logo = <img src={logo.props.src} width='24' alt={r.name} />
            }
            return (
              <label
                key={i}
                className='input input-bordered flex items-center gap-2'
              >
                <input
                  type='text'
                  name={r.name}
                  className='grow'
                  placeholder={socialMedia.find((e) => e.name === r.name)
                    ?.placeholder}
                  value={r.url}
                  onChange={(e) =>
                    settings.changeSocialMedia(r.name, parseShopName(e.target.value))}
                />
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => settings.removeSocialMedia(r.name)}
                    className='btn btn-error btn-sm'
                  >
                    Remove
                  </button>
                  <div className="hidden sm:block">
                    {logo}
                  </div>
                </div>
              </label>
            )
          })}
        </div>
        <button
          onClick={() =>
            (document as any).getElementById('social_media_modal')?.showModal()}
          className='btn btn-info'
        >
          Add <Plus />
        </button>
      </div>

      <PhoneNumberInput
        value={settings.phone}
        onChange={(r) => settings.changeSetting('phone', r)}
        inputClassName='input-primary'
        label='Contact number (optional)'
      />
      <SocialMediaModal />
    </div>
  )
}
