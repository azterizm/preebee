import { LoaderFunctionArgs } from '@remix-run/node'
import toTime from 'to-time'
import fs from 'fs/promises'
import path from 'path'
import { UPLOADS_PATH } from '~/constants/api.server'
import { prisma } from '~/db.server'

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id
  const image = await prisma.reviewImage.findFirst({
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
  return new Response(buffer, {
    headers: {
      'Content-Type': image?.fileType ||
        'application/octet-stream',
      'Content-Length': image?.fileSize.toString() || '0',
      'Cache-Control': `max-age=${toTime('7d').seconds()}, public`
    },
  })
}
