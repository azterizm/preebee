import { authenticator } from '~/auth.server'
import { resetOnboardData } from './onboard/handle.server'
import { ActionFunctionArgs, redirect } from '@remix-run/node'

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request)
  if (user) await resetOnboardData(user.id)
  return 'ok'
}

export function loader() {
  return redirect('/')
}
