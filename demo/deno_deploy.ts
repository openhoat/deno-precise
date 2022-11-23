import { dirname, fromFileUrl, resolve } from './deps/std.ts'
import { assets, exposeVersion, WebServer } from '../mod.ts'

const __dirname = dirname(fromFileUrl(import.meta.url))
const assetsBaseDir = resolve(__dirname, 'assets')
const webServer = new WebServer({
  handlers: [
    {
      path: '/hello',
      handler: () =>
        new Response('Hello World!', {
          headers: { 'content-type': 'text/plain' },
        }),
    },
    assets({ root: assetsBaseDir }),
  ],
})
webServer.setOnSendHook(exposeVersion())
await webServer.start()
