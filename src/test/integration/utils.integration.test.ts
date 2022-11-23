import type { HttpMethodSpec, RequestHandlerSpec } from '../../main/types/web/utils.d.ts'
import { describe, expect, it, run } from '../deps/x/tincan.ts'
import {
  hostnameForDisplay,
  HttpMethodSpecs,
  routeToString,
  toRequestHandlerSpecs,
} from '../../main/web/utils.ts'

describe('utils integration tests', () => {
  describe('hostnameForDisplay', () => {
    it('should return "foo.local.io" given "foo.local.io"', () => {
      // Given
      const hostname = 'foo.local.io'
      // When
      const result = hostnameForDisplay(hostname)
      // Then
      expect(result).toEqual(hostname)
    })
    it('should return "localhost" given nothing', () => {
      // When
      const result = hostnameForDisplay()
      // Then
      expect(result).toEqual('localhost')
    })
    it('should return "localhost" given "0.0.0.0"', () => {
      // Given
      const hostname = '0.0.0.0'
      // When
      const result = hostnameForDisplay(hostname)
      // Then
      expect(result).toEqual('localhost')
    })
  })
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
  describe('toRequestHandlerSpecs', () => {
    it('should return a RequestHandlerSpec array given a function', () => {
      // Given
      const handler = () => 'foo'
      // When
      const result = toRequestHandlerSpecs(handler)
      // Then
      expect(result).toEqual([{ handler }])
    })
    it('should return a RequestHandlerSpec array given a RequestHandlerSpec', () => {
      // Given
      const handler = () => 'foo'
      const requestHandlerSpec: RequestHandlerSpec = { handler }
      // When
      const result = toRequestHandlerSpecs(requestHandlerSpec)
      // Then
      expect(result).toEqual([{ handler }])
    })
    it('should return the given RequestHandlerSpec array given a RequestHandlerSpec array', () => {
      // Given
      const handler = () => 'foo'
      const requestHandlerSpec: RequestHandlerSpec[] = [{ handler }]
      // When
      const result = toRequestHandlerSpecs(requestHandlerSpec)
      // Then
      expect(result).toEqual([{ handler }])
    })
  })
})

run()
