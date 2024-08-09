import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { authenticator } from '~/auth.server'

export let loader = () => redirect('/login')

export let action = async ({ request }: ActionFunctionArgs) => {
  return authenticator.authenticate('google', request)
}
