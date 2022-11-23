import type { Routerable } from '../../../main/types/web/router.d.ts'
import type { WebServerable } from '../../../main/types/web/web-server.d.ts'
import { beforeAll, describe, expect, it, run } from '../../deps/x/tincan.ts'
import { isRouter, Router } from '../../../main/web/router.ts'
import { assertSpyCall, assertSpyCalls, spy, stub } from '../../deps/std.ts'

describe('web router unit tests', () => {
  describe('isRouter', () => {
    it('should return true given a Router instance', () => {
      // Given
      const o = new Router()
      // When
      const result = isRouter(o)
      // Then
      expect(result).toBe(true)
    })
    it('should return false given anything that is not a Router instance', () => {
      // Given
      const o = { foo: 'bar' }
      // When
      const result = isRouter(o)
      // Then
      expect(result).toBe(false)
    })
  })
  describe('Router', () => {
    describe('instance', () => {
      let router: Routerable
      beforeAll(() => {
        router = new Router()
      })
      describe('register', () => {
        it('should register routes to server given a router and a request handler spec', () => {
          // Given
          const serverRegister = spy()
          const server = { register: serverRegister } as unknown as WebServerable
          const anotherRouter = new Router({ prefix: '/test' })
          const anotherRouterRegisterToServerStub = stub(anotherRouter, 'registerToServer')
          const handler = spy()
          // When
          const result = [router.register(anotherRouter), router.register({ handler })]
          router.registerToServer(server, '/foo')
          // Then
          expect(result).toEqual([router, router])
          assertSpyCalls(anotherRouterRegisterToServerStub, 1)
          assertSpyCall(anotherRouterRegisterToServerStub, 0, {
            args: [server, '/foo'],
          })
          assertSpyCalls(serverRegister, 1)
          assertSpyCall(serverRegister, 0, {
            args: [
              {
                handler,
                path: '/foo',
              },
            ],
          })
        })
        it('should register a new router given a request handler', () => {})
      })
      // describe('registerToServer', () => {})
    })
  })
})

run()
