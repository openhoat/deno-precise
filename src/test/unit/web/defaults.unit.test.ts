import type { Spy, Stub } from '../../../../dev_deps/std.ts'
import { assertSpyCall, stub } from '../../../../dev_deps/std.ts'
import type {
  RequestHandlerContext,
  RequestWithRouteParams,
} from '../../../main/types/web/utils.d.ts'
import { RequestHandlerResult } from '../../../main/types/web/utils.d.ts'
import type { WebServerable } from '../../../main/types/web/web-server.d.ts'
import { ConsoleStream, Logger } from '../../../../deps/x/optic.ts'
import { afterAll, beforeAll, describe, expect, it, run } from '../../../../dev_deps/x/tincan.ts'
import { _internals, defaults } from '../../../main/web/defaults.ts'
import { noop, testLogger } from '../../utils.ts'

describe('web defaults integration tests', () => {
  describe('buildLogger', () => {
    let consoleLogMock: Spy<Console, string[], void>
    let internalConsoleStream: Readonly<ConsoleStream>
    beforeAll(() => {
      consoleLogMock = stub(console, 'log', noop)
      console.log = consoleLogMock
      internalConsoleStream = _internals.consoleStream
      _internals.consoleStream = new ConsoleStream().withLogFooter(false)
    })
    afterAll(() => {
      consoleLogMock.restore()
      _internals.consoleStream = internalConsoleStream
    })
    it('should return a default logger instance', () => {
      const logger = defaults.buildLogger()
      expect(logger).toBeInstanceOf(Logger)
      expect(consoleLogMock.calls).toHaveLength(1)
      expect(consoleLogMock.calls[0].args).toHaveLength(1)
      expect(consoleLogMock.calls[0].args).toMatch(
        / Info\s+Logging session initialized. Initial logger min log level:/,
      )
      assertSpyCall(consoleLogMock, 0)
    })
  })
  describe('errorHandler', () => {
    let loggerInfoStub: Stub
    beforeAll(() => {
      loggerInfoStub = stub(testLogger, 'info', noop)
    })
    afterAll(() => {
      loggerInfoStub.restore()
    })
    it('should return a response given an error', () => {
      const webServer = { logger: testLogger } as unknown as WebServerable
      const req = {} as RequestWithRouteParams
      const err = new Error('oops')
      const context = {} as RequestHandlerContext
      const result: RequestHandlerResult = defaults.errorHandler.call(webServer, req, err, context)
      expect(result).toBeTruthy()
      expect(result).toBeInstanceOf(Response)
    })
    it('should return undefined given a context with result', () => {
      const webServer = { logger: testLogger } as unknown as WebServerable
      const req = {} as RequestWithRouteParams
      const err = new Error('oops')
      const context = { result: 'foo' } as RequestHandlerContext
      const result: RequestHandlerResult = defaults.errorHandler.call(webServer, req, err, context)
      expect(result).toBeUndefined()
    })
  })
  describe('notFoundHandler', () => {
    it('should return a JSON response given the request accepts JSON', () => {
      const jsonMimeType = 'application/json'
      const webServer = { logger: testLogger } as unknown as WebServerable
      const req = {
        headers: new Headers({ accept: jsonMimeType }),
      } as RequestWithRouteParams
      const context = {} as RequestHandlerContext
      const result = defaults.notFoundHandler.call(webServer, req, context)
      expect(result).toBeTruthy()
      expect(result).toBeInstanceOf(Response)
      if (result instanceof Response) {
        expect(result.headers.get('content-type')).toEqual(jsonMimeType)
      }
    })
    it('should return a text response given the request accepts text', () => {
      const textMimeType = 'text/plain'
      const webServer = { logger: testLogger } as unknown as WebServerable
      const req = {
        headers: new Headers({ accept: textMimeType }),
      } as RequestWithRouteParams
      const context = {} as RequestHandlerContext
      const result = defaults.notFoundHandler.call(webServer, req, context)
      expect(result).toBeTruthy()
      expect(result).toBeInstanceOf(Response)
      if (result instanceof Response) {
        expect(result.headers.get('content-type')).toEqual(`${textMimeType};charset=UTF-8`)
      }
    })
    it('should return a HTML response given the request accepts nothing', () => {
      const textMimeType = 'text/html'
      const webServer = { logger: testLogger } as unknown as WebServerable
      const req = { headers: new Headers() } as RequestWithRouteParams
      const context = {} as RequestHandlerContext
      const result = defaults.notFoundHandler.call(webServer, req, context)
      expect(result).toBeTruthy()
      expect(result).toBeInstanceOf(Response)
      if (result instanceof Response) {
        expect(result.headers.get('content-type')).toEqual(textMimeType)
      }
    })
  })
})

run()
