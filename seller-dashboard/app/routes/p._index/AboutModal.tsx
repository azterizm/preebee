import { forwardRef } from 'react'

const AboutModal = forwardRef<HTMLDialogElement, {
  shop: { title: string; phone?: string | null; address?: string | null }
}>((props, ref) => {
  return (
    <dialog ref={ref} id='about_modal' className='modal'>
      <div className='modal-box'>
        <h3 className='font-bold text-lg'>About</h3>
        <div className='prose py-4'>
          <h1 className='mb-0'>{props.shop.title}</h1>
          {props.shop.phone && (
            <p className='mt-0'>Contact No. {props.shop.phone}</p>
          )}
          {props.shop.address && <p>Address: {props.shop.address}</p>}
        </div>
        <div className='modal-action'>
          <form method='dialog'>
            <button className='btn'>Close</button>
          </form>
        </div>
      </div>
    </dialog>
  )
})

export default AboutModal
