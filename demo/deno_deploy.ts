import { WebServer } from '../mod.ts'

const webServer = new WebServer({
  handlers: {
    path: '/hello',
    handler: () =>
      new Response('Hello World!', {
        headers: { 'content-type': 'text/plain' },
      }),
  },
})
await webServer.start()
