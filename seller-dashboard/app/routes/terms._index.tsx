import { redirect } from '@remix-run/node'
export const loader = async () => {
  return redirect('/terms_and_conditions')
}
