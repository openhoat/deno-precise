import WebServer, {
  exitOnSignals,
} from 'https://raw.githubusercontent.com/openhoat/deno-precise/main/mod.ts'

const webServer = new WebServer()

webServer.register({
  path: '/',
  handler: function fooHandler() {
    return Response.json({ foo: 'bar' })
  },
})

await webServer.start()

exitOnSignals(webServer)

webServer.logger.info(`Type 'kill -s SIGTERM ${Deno.pid}' to stop`)
