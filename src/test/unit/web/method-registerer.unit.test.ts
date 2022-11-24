import type { Routerable } from '../../../main/types/web/router.d.ts'
import type {
  MethodRegisterable,
  RequestHandler,
  RequestHandlerSpec,
} from '../../../main/types/web/web-server.d.ts'
import { beforeAll, describe, it, run } from '../../deps/x/tincan.ts'
import { MethodRegisterer } from '../../../main/web/method-registerer.ts'
import { assertSpyCall, assertSpyCalls, Spy, spy } from '../../deps/std.ts'
import { HttpMethodSpecs } from '../../../main/web/http-method.ts'

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
        path: string
      }[] = [
        { name: 'all', method: HttpMethodSpecs.ALL, path: '/foo' },
        { name: 'delete', method: HttpMethodSpecs.DELETE, path: '/hello' },
        { name: 'get', method: HttpMethodSpecs.GET, path: '/foo/bar' },
        { name: 'head', method: HttpMethodSpecs.HEAD, path: '/foo/hello' },
        { name: 'options', method: HttpMethodSpecs.OPTIONS, path: '/foo/world' },
        { name: 'patch', method: HttpMethodSpecs.PATCH, path: '/hello' },
        { name: 'post', method: HttpMethodSpecs.POST, path: '/hello/world' },
        { name: 'purge', method: HttpMethodSpecs.PURGE, path: '/hello/world/bar' },
        { name: 'put', method: HttpMethodSpecs.PUT, path: '/world' },
        { name: 'trace', method: HttpMethodSpecs.TRACE, path: '/world/foo' },
      ]
      usecases.forEach(({ name, path, method }, index) => {
        describe(name, () => {
          it(`should call register, given path '${path}', method '${method}' and a request handler`, () => {
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
