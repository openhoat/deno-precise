import { fromFileUrl, resolve } from 'https://deno.land/std@0.162.0/path/mod.ts'
import { assets, WebServer } from '../mod.ts'

const assetsBaseDir = resolve(fromFileUrl(import.meta.url), '..', 'assets')
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
await webServer.start()
