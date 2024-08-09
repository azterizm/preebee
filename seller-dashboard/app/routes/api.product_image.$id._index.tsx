import { LoaderFunctionArgs } from '@remix-run/node'
import fs from 'fs/promises'
import path from 'path'
import { authenticator } from '~/auth.server'
import { UPLOADS_PATH } from '~/constants/api.server'
import { prisma } from '~/db.server'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request)
  const id = params.id
  const image = await prisma.productImage.findFirst({
    where: { id },
    select: {
      fileSize: true,
      fileName: true,
      fileType: true,
    },
  })
  if (!image) {
    return new Response(null, { status: 404 })
  }
  const buffer = await fs.readFile(
    path.join(
      UPLOADS_PATH,
      image?.fileName,
    ),
  )
  if (user && user.shop) {
    const productBelongsToUser = await prisma.productImage.count({
      where: { id, product: { shopId: user.shop.id } },
    })
    if (productBelongsToUser) {
      return new Response(buffer, {
        headers: {
          'Content-Type': image?.fileType ||
            'application/octet-stream',
          'Content-Length': image?.fileSize.toString() || '0',
          'cache-control': `no-store, no-cache`
        },
      })
    }
  }
  return new Response(buffer, {
    headers: {
      'Content-Type': image?.fileType ||
        'application/octet-stream',
     //'Content-Length': image?.fileSize.toString() || '0',
     //'cache-control': `max-age=${toTime('7d').seconds()}, public`
    },
  })
}
