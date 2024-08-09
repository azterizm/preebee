import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { authenticator } from '~/auth.server'
import { resetOnboardData } from './onboard/handle.server'

export function loader() {
  return redirect('/')
}
export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })
  const form = await request.formData()
  const action = form.get('action')?.toString()
  if (action === 'reset') {
    await resetOnboardData(user.id)
  }

  return 'ok'
}
