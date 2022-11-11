import { WebServer, stopOnSignals } from '../mod.ts'

const webServer = new WebServer()
webServer.register({
  path: '/',
  handler: () => ({ foo: 'bar' }),
})
await webServer.start()
stopOnSignals(webServer)
