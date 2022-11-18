import { Level, Logger } from '../../../deps/x/optic.ts'
import { exposeVersion, version, WebServer } from '../../../mod.ts'
import { describe, expect, it, run } from '../../../dev_deps/x/tincan.ts'

describe('API server e2e tests', () => {
  const logger = new Logger('test').withMinLogLevel(Level.Critical)
  describe('GET /test', () => {
    it('should start, handle the request, respond a simple JSON, then stop, given a web server initialized with a simple test request handler', async () => {
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
        expect(jsonData).toEqual(testResponseBody)
        const versionHeader = response.headers.get('X-Powered-By')
        expect(versionHeader).toEqual(`Precise/${version}`)
      } finally {
        if (webServer.started) {
          await webServer.stop()
        }
      }
    })
  })
})

run()
