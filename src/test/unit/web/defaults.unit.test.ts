import type { Spy } from '../../../../dev_deps/std.ts'
import { assertSpyCall, stub } from '../../../../dev_deps/std.ts'
import type { LoggerStub } from '../../types/utils.d.ts'
import type {
  RequestHandlerContext,
  RequestWithRouteParams,
} from '../../../main/types/web/utils.d.ts'
import { RequestHandlerResult } from '../../../main/types/web/utils.d.ts'
import type { WebServerable } from '../../../main/types/web/web-server.d.ts'
import { ConsoleStream, Logger } from '../../../../deps/x/optic.ts'
import { afterAll, beforeAll, describe, expect, it, run } from '../../../../dev_deps/x/tincan.ts'
import { _internals, defaults } from '../../../main/web/defaults.ts'
import { memberReplacer, noop, stubLogger } from '../../utils.ts'

describe('web defaults integration tests', () => {
  let loggerStub: LoggerStub
  beforeAll(() => {
    loggerStub = stubLogger()
  })
  afterAll(() => {
    loggerStub.restore()
  })
  describe('buildConsoleStream', () => {
    it('should return the default logger console stream', () => {
      const result = _internals.buildConsoleStream()
      expect(result).toBeTruthy()
      expect(result).toBeInstanceOf(ConsoleStream)
    })
  })
  describe('buildLogger', () => {
    let consoleLogSpy: Spy<Console, string[], void>
    let internalsRestore: () => void
    beforeAll(() => {
      consoleLogSpy = stub(console, 'log', noop)
      console.log = consoleLogSpy
      internalsRestore = memberReplacer(_internals, {
        buildConsoleStream: () => new ConsoleStream().withLogFooter(false),
      })
    })
    afterAll(() => {
      internalsRestore()
      consoleLogSpy.restore()
    })
    it('should return a default logger instance', () => {
      // When
      const logger = defaults.buildLogger()
      // Then
      expect(logger).toBeInstanceOf(Logger)
      expect(consoleLogSpy.calls).toHaveLength(1)
      expect(consoleLogSpy.calls[0].args).toHaveLength(1)
      expect(consoleLogSpy.calls[0].args).toMatch(
        / Info\s+Logging session initialized. Initial logger min log level:/,
      )
      assertSpyCall(consoleLogSpy, 0)
    })
  })
  describe('errorHandler', () => {
    it('should return a response given an error', () => {
      // Given
      const webServer = { logger: loggerStub.logger } as unknown as WebServerable
      const req = {} as RequestWithRouteParams
      const err = new Error('oops')
      const context = {} as RequestHandlerContext
      // When
      const result: RequestHandlerResult = defaults.errorHandler.call(webServer, req, err, context)
      // Then
      expect(result).toBeTruthy()
      expect(result).toBeInstanceOf(Response)
    })
    it('should return undefined given a context with result', () => {
      // Given
      const webServer = { logger: loggerStub.logger } as unknown as WebServerable
      const req = {} as RequestWithRouteParams
      const err = new Error('oops')
      const context = { result: 'foo' } as RequestHandlerContext
      // When
      const result: RequestHandlerResult = defaults.errorHandler.call(webServer, req, err, context)
      // Then
      expect(result).toBeUndefined()
    })
  })
  describe('notFoundHandler', () => {
    it('should return a JSON response given the request accepts JSON', () => {
      // Given
      const jsonMimeType = 'application/json'
      const webServer = { logger: loggerStub.logger } as unknown as WebServerable
      const req = {
        headers: new Headers({ accept: jsonMimeType }),
      } as RequestWithRouteParams
      const context = {} as RequestHandlerContext
      // When
      const result = defaults.notFoundHandler.call(webServer, req, context)
      // Then
      expect(result).toBeTruthy()
      expect(result).toBeInstanceOf(Response)
      if (result instanceof Response) {
        expect(result.headers.get('content-type')).toEqual(jsonMimeType)
      }
    })
    it('should return a text response given the request accepts text', () => {
      // Given
      const textMimeType = 'text/plain'
      const webServer = { logger: loggerStub.logger } as unknown as WebServerable
      const req = {
        headers: new Headers({ accept: textMimeType }),
      } as RequestWithRouteParams
      const context = {} as RequestHandlerContext
      // When
      const result = defaults.notFoundHandler.call(webServer, req, context)
      // Then
      expect(result).toBeTruthy()
      expect(result).toBeInstanceOf(Response)
      if (result instanceof Response) {
        expect(result.headers.get('content-type')).toEqual(`${textMimeType};charset=UTF-8`)
      }
    })
    it('should return a HTML response given the request accepts nothing', () => {
      // Given
      const textMimeType = 'text/html'
      const webServer = { logger: loggerStub.logger } as unknown as WebServerable
      const req = { headers: new Headers() } as RequestWithRouteParams
      const context = {} as RequestHandlerContext
      // When
      const result = defaults.notFoundHandler.call(webServer, req, context)
      // Then
      expect(result).toBeTruthy()
      expect(result).toBeInstanceOf(Response)
      if (result instanceof Response) {
        expect(result.headers.get('content-type')).toEqual(textMimeType)
      }
    })
  })
})

run()
