import { Form, useFetcher } from '@remix-run/react'
import { serialize } from 'object-to-formdata'

const Reset = (props: { className?: string }) => {
  const fetcher = useFetcher()
  function onReset() {
    fetcher.submit(serialize({ action: 'reset' }), {
      method: 'post',
      action: '/api/onboard/reset',
    })
  }
  return (
    <Form method='post' action='/onboard/reset' className={props.className}>
      <button
        type='button'
        onClick={onReset}
        name='action'
        value='reset'
        className='btn btn-sm btn-error'
        disabled={fetcher.state !== 'idle'}
      >
        Reset
      </button>
    </Form>
  )
}

export default Reset
