import type { LinksFunction } from '@remix-run/node'
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from '@remix-run/react'
import globalCss from '~/styles/global.css?url'
import Logo from './components/Logo'

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: globalCss,
  },
  {
    rel: 'stylesheet',
    href: '/styles/boska.css',
  },
  {
    rel: 'stylesheet',
    href: '/styles/general-sans.css',
  },
]

export default function App() {
  return (
    <html lang='en' data-theme='light'>
      <head>
        <meta charSet='utf-8' />
        <link rel="manifest" href="/resource/manifest.json" />
        <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
        <link rel='icon' href='/logo.svg' type='image/svg+xml' />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  return (
    <html>
      <head>
        <title>Oh no! | Preebee</title>
        <Meta />
        <Links />
      </head>
      <body className='flex flex-col justify-center items-center space-y-8'>
        <Logo />
        <p className="text-center text-lg font-medium">
          {error?.toString()}
        </p>
        <Link to='/' className="btn btn-primary">Go home</Link>
        <Scripts />
      </body>
    </html>
  )
}

