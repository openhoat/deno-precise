import { afterAll, describe, expect, it, run } from '../../../deps/x/tincan.ts'
import {
  _internals,
  assets,
  AssetsHandlerOptions,
} from '../../../../main/web/middlewares/assets.ts'
import { memberReplacer, noop } from '../../../utils.ts'
import { assertSpyCall, assertSpyCalls, spy } from '../../../deps/std.ts'
import { isRouter, Router } from '../../../../main/web/router.ts'

describe('web middlewares assets unit tests', () => {
  describe('assets', () => {
    let internalsRestore: () => void
    afterAll(() => {
      internalsRestore()
    })
    it('should return a request handler spec to serve assets, given root "/tmp"', () => {
      // Given
      const options: AssetsHandlerOptions = { root: '/tmp' }
      const buildHandlerSpy = spy(() => noop)
      internalsRestore = memberReplacer(_internals, { buildHandler: buildHandlerSpy })
      // When
      const result = assets(options)
      // Then
      assertSpyCalls(buildHandlerSpy, 1)
      assertSpyCall(buildHandlerSpy, 0, { args: ['/tmp', '/assets'] })
      expect(result).toBeInstanceOf(Router)
      if (result instanceof Router) {
        expect(result.prefix).toEqual('/assets')
      }
      // expect(typeof result.handler).toEqual('function')
      // expect(result).toEqual({
      //   name: 'assetsHandler',
      //   handler: result.handler,
      //   path: '/assets/:path',
      // })
    })
    it('should return a request handler spec to serve assets, given index is false', () => {
      // Given
      const options: AssetsHandlerOptions = { root: '/tmp', index: false }
      const buildHandlerSpy = spy(() => noop)
      internalsRestore = memberReplacer(_internals, { buildHandler: buildHandlerSpy })
      // When
      const result = assets(options)
      // Then
      assertSpyCalls(buildHandlerSpy, 1)
      assertSpyCall(buildHandlerSpy, 0, { args: ['/tmp', '/assets'] })
      const resultIsRouter = isRouter(result)
      expect(resultIsRouter).toBe(false)
      if (!resultIsRouter) {
        expect(typeof result.handler).toEqual('function')
        expect(result).toEqual({
          name: 'assetsHandler',
          handler: result.handler,
          path: '/assets/:path',
        })
      }
    })
  })
})

run()
