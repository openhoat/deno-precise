import type { HttpMethodSpec } from '../../../lib/types/web/http-method.d.ts'
import type { Routerable } from '../../../lib/types/web/router.d.ts'
import type { RequestHandlerSpec } from '../../../lib/types/web/web-server.d.ts'
import { describe, expect, it, run } from '../../../deps/test/x/tincan.ts'
import { HttpMethodSpecs } from '../../../lib/web/http-method.ts'
import { routeToString, toMiddleware } from '../../../lib/web/web-server.ts'
import { Router } from '../../../lib/web/router.ts'

describe('web server integration tests', () => {
  describe('routeToString', () => {
    it('should return "getFooBar" given a GET method and /foo/bar pathname', () => {
      // Given
      const method: HttpMethodSpec = HttpMethodSpecs.GET
      const pathname = '/foo/bar'
      // When
      const result = routeToString(method, pathname)
      // Then
      expect(result).toEqual('getFooBar')
    })
    it('should return "postAll" given a POST method and no pathname', () => {
      // Given
      const method: HttpMethodSpec = HttpMethodSpecs.POST
      const pathname = undefined
      // When
      const result = routeToString(method, pathname)
      // Then
      expect(result).toEqual('postAll')
    })
  })
  describe('toMiddleware', () => {
    it('should return a Middleware given a function', () => {
      // Given
      const handler = () => 'foo'
      // When
      const result = toMiddleware(handler)
      // Then
      expect(result).toEqual({ handler })
    })
    it('should return a Middleware given a RequestHandlerSpec', () => {
      // Given
      const handler = () => 'foo'
      const requestHandlerSpec: RequestHandlerSpec = { handler }
      // When
      const result = toMiddleware(requestHandlerSpec)
      // Then
      expect(result).toEqual({ handler })
    })
    it('should return the given Middleware given a Routerable', () => {
      // Given
      const router: Routerable = new Router()
      // When
      const result = toMiddleware(router)
      // Then
      expect(result).toEqual(router)
    })
  })
})

run()
