import { exposeVersion, WebServer } from '../mod.ts'

const webServer = new WebServer()
webServer.setOnSendHook(exposeVersion())
webServer.register({
  path: '/',
  handler: () => ({ foo: 'bar' }),
})
await webServer.start()
