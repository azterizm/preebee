import {
    LoaderFunctionArgs,
    redirect
} from '@remix-run/node'
import { authenticator } from '~/auth.server'
import { getOnboardData } from './onboard/handle.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })

  const { customize, name } = await getOnboardData(user.id)
  if (!name) return redirect('/onboard/select-name')
  else if (!customize) return redirect('/onboard/customize')
  if (name && customize) return redirect('/onboard/done')
  return redirect('/dashboard')
}


