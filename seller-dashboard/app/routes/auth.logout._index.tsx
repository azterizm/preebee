import {
    ActionFunctionArgs,
    redirect
} from '@remix-run/node'
import { authenticator } from '~/auth.server'

export async function loader() {
  return redirect('/')
}
export async function action({ request }: ActionFunctionArgs) {
  return authenticator.logout(request, {
    redirectTo: '/login',
  })
}
