import { createRequestHandler } from '@remix-run/express'
import morgan from 'morgan'
import { installGlobals } from '@remix-run/node'
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()
installGlobals()

const viteDevServer = process.env.NODE_ENV === 'production'
  ? undefined
  : await import('vite').then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    })
  )

const app = express()

if (viteDevServer) {
  app.use(viteDevServer.middlewares)
} else {
  app.use(
    '/assets',
    express.static('build/client/assets', {
      immutable: true,
      maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
    }),
  )
}
app.use(express.static('build/client', { maxAge: '1h' }))
app.use(morgan('tiny'))

app.all(
  '*',
  createRequestHandler({
    build: viteDevServer
      ? () =>
        viteDevServer.ssrLoadModule(
          'virtual:remix/server-build',
        )
      : await import('./build/server/index.js'),
  }),
)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(
    'http://localhost:' + port,
  )
})
