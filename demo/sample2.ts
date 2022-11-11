import { WebServer, shutdownOnSignals } from '../mod.ts'

const webServer = new WebServer()
shutdownOnSignals(webServer)
webServer.register({
  path: '/',
  handler: () => ({ foo: 'bar' }),
})
await webServer.start()
