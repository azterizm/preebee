import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { prisma } from '~/db.server'
import { requireSellerWithShop } from '~/session.server'
import { generateIdForModel } from '~/utils/api'

export function loader() {
  return redirect('/')
}
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireSellerWithShop(request)
  const form = await request.formData()
  const name = form.get('input')?.toString()
  if (!name) throw new Error('NO INPUT')
  await prisma.category.create({
    data: {
      name,
      shopId: user.shop.id,
      id: await generateIdForModel(name, prisma.category),
    },
  })
  return null
}
