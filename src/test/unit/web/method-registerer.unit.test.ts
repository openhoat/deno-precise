import type { Routerable } from '../../../main/types/web/router.d.ts'
import type { RequestHandler, RequestHandlerSpec } from '../../../main/types/web/utils.d.ts'
import { MethodRegisterable } from '../../../main/types/web/utils.d.ts'
import { beforeAll, describe, it, run } from '../../deps/x/tincan.ts'
import { MethodRegisterer } from '../../../main/web/method-registerer.ts'
import { assertSpyCall, assertSpyCalls, Spy, spy } from '../../deps/std.ts'
import { HttpMethodSpecs } from '../../../main/web/utils.ts'

describe('web method registerer unit tests', () => {
  let registerSpy: Spy<MethodRegisterer<void>, [RequestHandlerSpec | Routerable]>

  class TestMethodRegisterer extends MethodRegisterer<void> {
    register(requestHandlerSpec: RequestHandlerSpec | Routerable) {
      registerSpy.call(this, requestHandlerSpec)
    }
  }

  beforeAll(() => {
    registerSpy = spy()
  })
  describe('MethodRegisterer', () => {
    describe('instance', () => {
      const usecases: {
        name: keyof MethodRegisterable<void>
        method: HttpMethodSpecs
      }[] = [
        { name: 'all', method: HttpMethodSpecs.ALL },
        { name: 'delete', method: HttpMethodSpecs.DELETE },
        { name: 'get', method: HttpMethodSpecs.GET },
        { name: 'head', method: HttpMethodSpecs.HEAD },
        { name: 'options', method: HttpMethodSpecs.OPTIONS },
        { name: 'patch', method: HttpMethodSpecs.PATCH },
        { name: 'post', method: HttpMethodSpecs.POST },
        { name: 'purge', method: HttpMethodSpecs.PURGE },
        { name: 'put', method: HttpMethodSpecs.PUT },
        { name: 'trace', method: HttpMethodSpecs.TRACE },
      ]
      usecases.forEach(({ name, method }, index) => {
        describe(name, () => {
          it('should call register method with a request handler spec given a path and a request handler', () => {
            // Given
            const registerer = new TestMethodRegisterer()
            const fooHandler: RequestHandler = () => {}
            // When
            registerer[name]('/foo', fooHandler)
            // Then
            assertSpyCalls(registerSpy, index + 1)
            assertSpyCall(registerSpy, index, {
              args: [
                {
                  handler: fooHandler,
                  method,
                  path: '/foo',
                },
              ],
            })
          })
        })
      })
    })
  })
})

run()
