import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { useWindowSize } from '@uidotdev/usehooks'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { authenticator } from '~/auth.server'
import { prisma } from '~/db.server'
import { customizeSchema } from './onboard.customize._index/schema'
import { getOnboardData, resetOnboardData } from './onboard/handle.server'
import { commitSession, getSession, logout } from '~/session.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })
  const data = await getOnboardData(user.id)
  const customize = customizeSchema.safeParse(
    JSON.parse(data.customize || '{}'),
  )

  if (!customize.success || !data.name) {
    await resetOnboardData(user.id)
    return redirect('/onboard/select-name')
  }

  let shop = await prisma.shop.findUnique({
    where: {
      id: customize.data.id,
    },
  })

  const session = await getSession(
    request.headers.get('Cookie') || '',
  )

  if (!shop) {
    const userExists = await prisma.seller.findUnique({
      where: { id: user.id },
    })
    if (!userExists) {
      return logout(request)
    }
    shop = await prisma.shop.create({
      data: {
        name: data.name,
        title: customize.data.name,
        color: customize.data.color,
        description: customize.data.description,
        layout: customize.data.layout,
        id: customize.data.id,
        phone: customize.data.phone,
        socialMedia: {
          create: customize.data.socialMedia.map((r) => ({
            name: r.name,
            link: r.url,
          })),
        },
        logoFileName: customize.data.logoFileName,
        seller: {
          connect: {
            id: user.id,
          },
        },
      },
    })
  }

  session.set(authenticator.sessionKey, {
    ...user,
    shop: {
      id: shop.id,
      name: shop.name,
    },
  })

  return json({ name: data.name, color: customize.data.color }, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  })
}

export default function Done() {
  const data = useLoaderData<typeof loader>()
  const { width, height } = typeof window === 'undefined'
    ? {
      width: 0,
      height: 0,
    }
    : useWindowSize()
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    _.delay(() => setProgress(25), Math.random() * 1000)
    _.delay(() => setProgress(50), 1000 + Math.random() * 2000)
    _.delay(() => setProgress(75), 2000 + Math.random() * 3000)
    _.delay(() => setProgress(100), 3000 + Math.random() * 5000)
    _.delay(() => setDone(true), 5000 + Math.random() * 1000)
  }, [])

  return (
    <div>
      {!done
        ? (
          <div className='prose text-center mx-auto'>
            <p className='animate-pulse'>
              Your shop is getting ready...
            </p>

            <div
              className='radial-progress bg-primary text-primary-content border-4 border-primary'
              style={{
                '--value': progress,
                '--size': '12rem',
                '--thickness': '2rem',
              } as any}
              role='progressbar'
            >
              {progress}%
            </div>
          </div>
        )
        : (
          <div>
            <div className='prose text-center mx-auto'>
              <h1>Your shop is now live!</h1>
              <p>You can now visit your shop from the following website.</p>
              <Link
                target='_blank'
                to={`https://${data.name}.preebee.com`}
                className={`link text-${data.color || 'blue'}-600 text-xl`}
              >
                {data.name}.preebee.com
              </Link>
            </div>
            <div className='flex items-center gap-2 justify-center mt-8 flex-wrap'>
              <Link className='btn btn-primary' to='/dashboard'>Open Dashboard</Link>
              <Link
                className='btn btn-secondary'
                to={`https://${data.name}.preebee.com`}
                target='_blank'
              >
                Open my website
              </Link>
            </div>
            <Confetti
              recycle={false}
              gravity={0.05}
              width={width || 0}
              height={height || 0}
            />
          </div>
        )}
    </div>
  )
}
