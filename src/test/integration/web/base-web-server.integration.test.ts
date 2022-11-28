import { describe, expect, it, run } from '../../deps/x/tincan.ts'
import { hostnameForDisplay } from '../../../main/web/base-web-server.ts'

describe('base web server integration tests', () => {
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
})

run()
