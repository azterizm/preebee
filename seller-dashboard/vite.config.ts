import { vitePlugin as remix } from '@remix-run/dev'
import { ConfigEnv, defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default ({ mode }: ConfigEnv) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return defineConfig({
    plugins: [
      remix(
        {
          ignoredRouteFiles: ['**/*.css'],
          serverModuleFormat: 'esm',
        },
      ),
      tsconfigPaths(),
    ],
  })
}
