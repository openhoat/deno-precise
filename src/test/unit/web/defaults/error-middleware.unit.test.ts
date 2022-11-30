import type { LoggerStub } from '../../../types/utils.d.ts'
import type {
  RequestHandlerContext,
  RequestHandlerResult,
  RequestWithRouteParams,
  WebServerable,
} from '../../../../main/types/web/web-server.d.ts'
import { afterAll, beforeAll, describe, expect, it, run } from '../../../deps/x/tincan.ts'
import { stubLogger } from '../../../utils.ts'
import { errorHandler } from '../../../../main/web/defaults/error-middleware.ts'

describe('web defaults error middleware unit tests', () => {
  let loggerStub: LoggerStub
  beforeAll(() => {
    loggerStub = stubLogger()
  })
  afterAll(() => {
    loggerStub.restore()
  })
  describe('errorHandler', () => {
    it('should return a response given an error', () => {
      // Given
      const webServer = { logger: loggerStub.logger } as unknown as WebServerable
      const req = {} as RequestWithRouteParams
      const err = new Error('oops')
      const context = {} as RequestHandlerContext
      // When
      const result: RequestHandlerResult = errorHandler.call(webServer, req, err, context)
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
      const result: RequestHandlerResult = errorHandler.call(webServer, req, err, context)
      // Then
      expect(result).toBeUndefined()
    })
  })
})

run()
