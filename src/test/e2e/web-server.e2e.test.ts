import { Level, Logger } from '../../main/deps/x/optic.ts'
import {
  assets,
  exposeVersion,
  HttpMethodSpec,
  RequestHandlerSpec,
  Routerable,
  version,
  WebServer,
  WebServerable,
} from '../../../mod.ts'
import { dirname, fromFileUrl, resolve } from '../../main/deps/std.ts'
import { afterEach, beforeAll, beforeEach, describe, expect, it, run } from '../deps/x/tincan.ts'

const __dirname = dirname(fromFileUrl(import.meta.url))
const assetsBaseDir = resolve(__dirname, 'assets')

describe('API server e2e tests', () => {
  const logger = new Logger('test').withMinLogLevel(Level.Critical)
  describe('GET /test', () => {
    type UseCase = {
      middleware: RequestHandlerSpec | Routerable
      method?: HttpMethodSpec
      path: string
      requestPath?: string
      expectedStatusCode?: number
      expectedBody?: unknown
      type: 'json' | 'text'
    }
    const usecases: UseCase[] = [
      {
        path: '/json',
        type: 'json',
        expectedBody: { foo: 'bar' },
        middleware: { path: '/json', handler: () => ({ foo: 'bar' }) },
      },
      {
        path: '/text',
        type: 'text',
        expectedBody: 'foo',
        middleware: { path: '/text', handler: () => 'foo' },
      },
      {
        path: '/assets',
        requestPath: '/assets/hello.txt',
        type: 'text',
        expectedBody: 'World!',
        middleware: assets({ root: assetsBaseDir }),
      },
    ]
    const middlewares: (RequestHandlerSpec | Routerable)[] = usecases.map(
      (usecase) => usecase.middleware,
    )
    let webServer: WebServerable
    beforeAll(() => {
      webServer = new WebServer({
        handlers: middlewares,
        logger,
      })
      webServer.setOnSendHook(exposeVersion())
    })
    beforeEach(async () => {
      await webServer.start()
    })
    afterEach(async () => {
      if (webServer?.started) {
        await webServer.stop()
      }
    })
    usecases.forEach(({ expectedStatusCode, expectedBody, method, path, requestPath, type }) => {
      const expectedBodyString = type === 'json' ? JSON.stringify(expectedBody) : expectedBody
      it(`should respond '${expectedBodyString}', given a '${method || 'GET'} ${
        requestPath || path
      }' request`, async () => {
        const url = `http://localhost:${webServer.port}${requestPath || path}`
        const response = await fetch(url, { method })
        expect(response.status).toEqual(expectedStatusCode || 200)
        expect(response.headers.get('X-Powered-By')).toEqual(`Precise/${version}`)
        const result = type === 'json' ? await response.json() : await response.text()
        expect(result).toEqual(expectedBody)
      })
    })
  })
})

run()
