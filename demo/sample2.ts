import WebServer, { exitOnSignals } from 'precise/mod.ts'

const webServer = new WebServer()
webServer.register({
  path: '/',
  handler: () => Response.json({ foo: 'bar' }),
})
await webServer.start()
exitOnSignals(webServer)
