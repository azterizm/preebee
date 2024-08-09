import classNames from 'classnames'
import socialMedia from '~/constants/social_media'
import _ from 'lodash'
import { Eye, EyeOff, Search } from 'react-feather'
import { useSettingsStore } from './state'

export default function Preview(props: {
  shopName: string
}) {
  const settings = useSettingsStore()
  const socialMediaData = settings.socialMedia.map((r) => ({
    ...r,
    ...socialMedia.find((v) => v.name === r.name),
  }))
  return (
    <>
      <div
        className={classNames(
          'fixed top-1/2 opacity-10 -z-10 scale-75 -right-1/4 -translate-y-1/2 hover:scale-100 cursor-pointer lg:cursor-default lg:opacity-100 lg:static lg:top-4 lg:left-0 lg:translate-y-0 lg:scale-100 lg:z-0',
          {
            '!opacity-100 z-10 left-1/2 -translate-x-1/2': settings.showPreview,
          },
        )}
      >
        <div className='mockup-browser border bg-base-300'>
          <div className='mockup-browser-toolbar'>
            <div className='input'>{props.shopName}.preebee.com</div>
          </div>
          <div
            className={classNames(
              'px-4 py-16 w-full',
              settings.color.slice(0, -3) + '200',
            )}
          >
            <div
              className={classNames(
                [
                  'flex justify-center items-center flex-col',
                  'flex items-center gap-4 justify-around w-full',
                  'flex justify-center items-center flex-col-reverse',
                  'flex items-center gap-4 justify-around w-full flex-row-reverse',
                ][settings.layout],
              )}
            >
              {settings.logoUrl
                ? (
                  <img
                    src={settings.logoUrl}
                    className={classNames('w-16', {
                      'mb-8': settings.layout === 0 || settings.layout === 2,
                      'mt-8': settings.layout === 2,
                    })}
                  />
                )
                : null}
              <div className='text-4xl font-bold text-center'>
                {settings.name ||
                  props.shopName.split('-').map((r) => _.capitalize(r)).join(
                    ' ',
                  )}
              </div>

              {settings.description && (
                <p className='max-w-lg mt-2 text-center'>{settings.description}</p>
              )}
              <div
                className={classNames(
                  [
                    'flex items-center gap-4 justify-center w-full mt-12 flex-wrap',
                    'flex items-center gap-4 justify-center w-max flex-col',
                    'flex items-center gap-4 justify-center w-full mb-12 flex-wrap',
                    'flex items-center gap-4 justify-center w-max flex-col',
                  ][settings.layout],
                )}
              >
                {socialMediaData.map((r) => (
                  <button
                    style={{
                      backgroundColor: r.color,
                      minWidth: '9rem',
                    }}
                    key={r.name}
                    className='btn text-white bg-blue-600'
                  >
                    {r.logo} {r.name}
                  </button>
                ))}
              </div>
            </div>
            <div className='flex items-center justify-center gap-2 mt-8'>
              <Search className='text-white/50' />{' '}
              <div className='w-32 h-6 rounded-lg bg-white/50' />
            </div>
            <div className='flex items-center justify-center flex-wrap w-full gap-4 mt-8'>
              {new Array(8).fill(null).map((_, i) => (
                <div
                  key={i}
                  className='w-1/4 aspect-square bg-white/50 rounded-lg'
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className='fixed bottom-4 left-4 lg:hidden z-20'>
        <button
          onClick={() =>
            settings.changeSetting('showPreview', !settings.showPreview)}
          className='btn btn-neutral'
        >
          {settings.showPreview ? 'Hide' : 'Show'} Preview{' '}
          {settings.showPreview ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </>
  )
}
