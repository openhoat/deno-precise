import { assertEquals } from '../../../dev_deps/std.ts'
import { Level, Logger } from '../../../deps/x/optic.ts'
import { exposeVersion, version, WebServer } from '../../../mod.ts'
import { description } from '../utils.ts'

Deno.test('API server e2e tests', async (t) => {
  const logger = new Logger('test').withMinLogLevel(Level.Critical)
  await t.step('GET /test', async (t) => {
    await t.step(
      description(
        {
          given: 'a web server initialized with a simple test request handler',
          should: 'start, handle the request, respond a simple JSON, then stop',
        },
        2,
      ),
      async () => {
        const webServer = new WebServer({
          logger,
        })
        const testRoutePath = '/test'
        const testResponseBody = { ok: true }
        webServer.setBeforeResponse(exposeVersion)
        webServer.get(testRoutePath, function testHandler() {
          return Response.json(testResponseBody)
        })
        try {
          await webServer.start()
          const response = await fetch(`http://localhost:${webServer.port}${testRoutePath}`)
          const jsonData = await response.json()
          assertEquals(jsonData, testResponseBody)
          const versionHeader = response.headers.get('X-Powered-By')
          assertEquals(versionHeader, `Precise/${version}`)
        } finally {
          if (webServer.started) {
            await webServer.stop()
          }
        }
      },
    )
  })
})
