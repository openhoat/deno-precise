import WebServer, { exitOnSignals } from '../../mod.ts'
import logger from './logger.ts'

const webServer = new WebServer({ logger })

webServer.register({
  path: '/',
  handler: function fooHandler() {
    return Response.json({ foo: 'bar' })
  },
})

webServer.register({
  path: '/stop',
  handler: function stopHandler() {
    setTimeout(async () => {
      try {
        await webServer.stop()
      } catch (err) {
        logger.error(err)
        Deno.exit(1)
      }
    }, 1000)
    return new Response(undefined, { status: 202 })
  },
})

try {
  await webServer.start()
} catch (err) {
  logger.error(err)
  Deno.exit(1)
}

exitOnSignals(webServer)

logger.info(`Type 'kill -s SIGTERM ${Deno.pid}' to stop`)
