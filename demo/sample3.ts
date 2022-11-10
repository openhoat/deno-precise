import { WebServer, exitOnSignals } from '../mod.ts'

const webServer = new WebServer()
const { logger } = webServer
webServer.register({
  method: 'POST',
  path: '/execute/:cmd',
  handler: (req) => {
    if (req.params?.cmd === 'stop') {
      setTimeout(async () => {
        try {
          await webServer.stop()
        } catch (err) {
          logger.error(err)
          Deno.exit(1)
        }
      }, 1000)
      return new Response(undefined, { status: 202 })
    }
    return { foo: 'bar' }
  },
})

try {
  await webServer.start()
} catch (err) {
  logger.error(err)
  Deno.exit(1)
}

exitOnSignals(webServer)
