import type { LoggerStub } from '../../../types/utils.d.ts'
import type {
  RequestHandlerContext,
  RequestWithRouteParams,
  WebServerable,
} from '../../../../lib/types/web/web-server.d.ts'
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  run,
} from '../../../../deps/test/x/tincan.ts'
import { stubLogger } from '../../../utils.ts'
import { notFoundHandler } from '../../../../lib/web/defaults/not-found-middleware.ts'

describe('web defaults not found middleware unit tests', () => {
  let loggerStub: LoggerStub
  beforeAll(() => {
    loggerStub = stubLogger()
  })
  afterAll(() => {
    loggerStub.restore()
  })
  describe('notFoundHandler', () => {
    it('should return a JSON response given the request accepts JSON', () => {
      // Given
      const jsonMimeType = 'application/json'
      const webServer = {
        logger: loggerStub.logger,
      } as unknown as WebServerable
      const req = {
        headers: new Headers({ accept: jsonMimeType }),
      } as RequestWithRouteParams
      const context = {} as RequestHandlerContext
      // When
      const result = notFoundHandler.call(webServer, req, context)
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
      const webServer = {
        logger: loggerStub.logger,
      } as unknown as WebServerable
      const req = {
        headers: new Headers({ accept: textMimeType }),
      } as RequestWithRouteParams
      const context = {} as RequestHandlerContext
      // When
      const result = notFoundHandler.call(webServer, req, context)
      // Then
      expect(result).toBeTruthy()
      expect(result).toBeInstanceOf(Response)
      if (result instanceof Response) {
        expect(result.headers.get('content-type')).toEqual(
          `${textMimeType};charset=UTF-8`,
        )
      }
    })
    it('should return a HTML response given the request accepts nothing', () => {
      // Given
      const textMimeType = 'text/html'
      const webServer = {
        logger: loggerStub.logger,
      } as unknown as WebServerable
      const req = { headers: new Headers() } as RequestWithRouteParams
      const context = {} as RequestHandlerContext
      // When
      const result = notFoundHandler.call(webServer, req, context)
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
