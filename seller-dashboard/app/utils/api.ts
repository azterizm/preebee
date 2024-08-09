import { NodeOnDiskFile } from '@remix-run/node'
import fs from 'fs/promises'
import mime from 'mime-types'
import path from 'path'
import { getClientIPAddress as getClientIPAddressUtil } from 'remix-utils/get-client-ip-address'
import sharp from 'sharp'
import slugify from 'slugify'
import { UPLOADS_PATH } from '~/constants/api.server'

export function getClientIPAddress(request: Request): string | null {
  return process.env.NODE_ENV === 'production'
    ? getClientIPAddressUtil(request)
    : 'localhost'
}

export function convertFormToJSON(form: FormData) {
  const json: Record<string, string> = {}
  const arrayKeys: Set<string> = new Set()
  for (const [key, value] of form) {
    if (key.includes('[]')) {
      const realKey = key.replace('[]', '')
      arrayKeys.add(realKey.split('[')[0])
      if (json[realKey]) {
        json[realKey] += `,${value}`
      } else {
        json[realKey] = value as string
      }
      continue
    }
    json[key] = value as string
  }
  for (const key of arrayKeys) {
    const targetKeys = Object.keys(json).filter((k) => k.startsWith(key)).map((
      k,
    ) => k.replace(`${key}[`, '').replace(']', ''))
    const values = targetKeys.map((k) =>
      json[`${key}[${k}]`].split(',').map((v) => v.trim()).map((r) => ({
        [k]: r,
      }))
    )
    const result = []
    for (let i = 0; i < values[0].length; i++) {
      const obj = {}
      for (const value of values) {
        Object.assign(obj, value[i])
      }
      result.push(obj)
    }
    json[key] = result as any
  }
  return json
}

export function convertDataUriToBuffer(dataUri: string) {
  const [, base64] = dataUri.split(',')
  return Buffer.from(base64, 'base64')
}

export async function convertDataUriToFile(dataUri: string, filename: string) {
  const [, base64] = dataUri.split(',')
  const extension = mime.extension(mime.lookup(dataUri) || 'image/png') || 'png'
  const fileName = filename + '.' + extension

  await fs.writeFile(
    path.join(UPLOADS_PATH, fileName),
    Buffer.from(base64, 'base64'),
    {
      encoding: 'base64',
    },
  )

  return fileName
}

export async function generateIdForModel(inputName: string, model: any) {
  let iteration = 0
  const name = slugify(inputName, {
    trim: true,
    lower: true,
    strict: true,
  })
  while (true) {
    const result = name + (iteration ? `-${iteration}` : '')
    let exists = await model.findUnique({
      where: {
        id: result,
      },
    })
    if (exists) {
      iteration++
      continue
    }
    return result
  }
}

export async function compressImageForThumbnail(file: NodeOnDiskFile) {
  const fileName = path.basename(file.name) + '.webp'
  await sharp(file.getFilePath()).resize(600, 600, { fit: 'cover' }).webp({
    quality: 80,
  }).toFile(
    path.join(UPLOADS_PATH, fileName),
  )
  return {
    name: fileName,
    size: (await fs.stat(path.join(UPLOADS_PATH, fileName))).size,
    type: 'image/webp',
  }
}

export function getShopNameFromUrl(request: Request) {
// if (process.env.NODE_ENV === 'development') return 'testtest'
  let { hostname } = new URL(request.url)
  let [tenant, , tld] = hostname.split(".")
  return tenant === 'www' || !tld || tld && !isNaN(Number(tld)) ? undefined : tenant
}

export function getUrlInfo(request: Request) {
  let { hostname } = new URL(request.url)
  let [subdomain, domain, tld] = hostname.split(".")
  return { subdomain, domain, tld }
}



