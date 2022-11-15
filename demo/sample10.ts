import { exposeVersion, WebServer } from '../mod.ts'

const webServer = new WebServer()
webServer.setBeforeResponse(exposeVersion)
webServer.register({
  path: '/',
  handler: () => ({ foo: 'bar' }),
})
await webServer.start()
