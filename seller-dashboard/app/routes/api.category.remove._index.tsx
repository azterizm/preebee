import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { prisma } from '~/db.server'
import { requireSellerWithShop } from '~/session.server'

export function loader() {
  return redirect('/')
}
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireSellerWithShop(request)
  const form = await request.formData()
  const id = form.get('id')?.toString()
  if (!id) throw new Error('NO INPUT')
  await prisma.category.delete({
    where: { id, shopId: user.shop.id },
  })
  return null
}
