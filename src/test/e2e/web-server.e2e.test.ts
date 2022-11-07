import { Level, Logger } from '/deps.ts'
import { assertEquals, description } from '/dev_deps.ts'
import WebServer from '/main/web/server.ts'

Deno.test('API server e2e tests', async (t) => {
  const logger = new Logger('test').withMinLogLevel(Level.Critical)
  await t.step(
    description({
      name: 'GET /test',
      given: 'a web server initialized with a simple test request handler',
      should: 'start, handle the request, respond a simple JSON, then stop',
    }),
    async () => {
      const webServer = new WebServer({
        logger,
      })
      const testRoutePath = '/test'
      const testResponseBody = { ok: true }
      webServer.register({
        path: testRoutePath,
        handler: function testHandler() {
          return Response.json(testResponseBody)
        },
      })
      try {
        await webServer.start()
        const jsonResponse = await fetch(`http://localhost:${webServer.port}${testRoutePath}`)
        const jsonData = await jsonResponse.json()
        assertEquals(jsonData, testResponseBody)
      } finally {
        if (webServer.started) {
          await webServer.stop()
        }
      }
    },
  )
})
