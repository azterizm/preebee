import { ChevronLeft, ChevronRight } from 'react-feather'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef, useState } from 'react'
import classNames from 'classnames'

export default function Carousel(props: {
  photos: string[]
  classnames?: string
}) {
  const [activeSlide, setActiveSlide] = useState(0)
  const container = useRef<HTMLDivElement>(null)
  const { contextSafe } = useGSAP({ scope: container })
  const goRight = contextSafe((index: number) => {
    gsap.to(`#slide${index + 1}`, {
      x: '-100%',
    })
    setActiveSlide(
      Math.min(index + 1, props.photos.length - 1),
    )
  })

  const goLeft = contextSafe((index: number) => {
    gsap.to(`#slide${index}`, {
      x: 0,
    })
    setActiveSlide(
      Math.max(index - 1, 0),
    )
  })

  return (
    <div
      ref={container}
      className={classNames(
        'relative rounded-xl overflow-hidden h-[80vh] col-span-4 flex',
      )}
    >
      {props.photos.map((r, i) => (
        <div
          id={`slide${i + 1}`}
          key={i}
          style={{
            zIndex: props.photos.length - i,
          }}
          className='absolute top-0 left-0 h-full w-full bg-white'
        >
          <img
            src={r}
            className='h-full object-cover object-center w-full bg-white'
          />
        </div>
      ))}
      <div
        id='buttons'
        className='top-1/2 px-5 -translate-y-1/2 left-0 w-full z-10 absolute flex justify-between'
      >
        <button
          onClick={() => goLeft(activeSlide)}
          className={classNames(
            'btn btn-circle',
            activeSlide === 0 ? 'opacity-0' : '',
          )}
        >
          <ChevronLeft />
        </button>
        {activeSlide === props.photos.length - 1 ? null : (
          <button
            onClick={() => goRight(activeSlide)}
            className='btn btn-circle'
          >
            <ChevronRight />
          </button>
        )}
      </div>
    </div>
  )
}
