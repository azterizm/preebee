import path from 'path'
import mime from 'mime-types'
import fs from 'fs/promises'
import { LoaderFunctionArgs } from '@remix-run/node'
import { UPLOADS_PATH } from '~/constants/api.server'
import { prisma } from '~/db.server'

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params?.id
  if (!id) return new Response(null, { status: 404 })
  const shop = await prisma.shop.findFirst({
    where: { id },
    select: {
      logoFileName: true,
    },
  })

  if (!shop?.logoFileName) {
    return new Response(null, { status: 404 })
  }
  const buffer = await fs.readFile(
    path.join(
      UPLOADS_PATH,
      shop.logoFileName,
    ),
  )

  return new Response(buffer, {
    headers: {
      'Content-Type': mime.lookup(shop.logoFileName) ||
        'application/octet-stream',
      'Content-Length': buffer.byteLength.toString() || '0',
    },
  })
}
