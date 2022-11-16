import type { Registerable, RequestHandler, RequestHandlerSpec } from '../types/web/utils.d.ts'
import type { Routerable } from '../types/web/router.d.ts'
import { HttpMethodSpecs } from './utils.ts'

abstract class MethodRegisterer<T extends Registerable<T>> implements Registerable<T> {
  all(path: string, handler: RequestHandler) {
    this.register({ handler, method: HttpMethodSpecs.ALL, path })
    return this
  }

  delete(path: string, handler: RequestHandler) {
    this.register({ handler, method: HttpMethodSpecs.DELETE, path })
    return this
  }

  get(path: string, handler: RequestHandler) {
    this.register({ handler, method: HttpMethodSpecs.GET, path })
    return this
  }

  head(path: string, handler: RequestHandler) {
    this.register({ handler, method: HttpMethodSpecs.HEAD, path })
    return this
  }

  options(path: string, handler: RequestHandler) {
    this.register({ handler, method: HttpMethodSpecs.OPTIONS, path })
    return this
  }

  patch(path: string, handler: RequestHandler) {
    this.register({ handler, method: HttpMethodSpecs.PATCH, path })
    return this
  }

  post(path: string, handler: RequestHandler) {
    this.register({ handler, method: HttpMethodSpecs.POST, path })
    return this
  }

  purge(path: string, handler: RequestHandler) {
    this.register({ handler, method: HttpMethodSpecs.PURGE, path })
    return this
  }

  put(path: string, handler: RequestHandler) {
    this.register({ handler, method: HttpMethodSpecs.PUT, path })
    return this
  }

  abstract register(requestHandlerSpec: RequestHandlerSpec | Routerable): T

  trace(path: string, handler: RequestHandler) {
    this.register({ handler, method: HttpMethodSpecs.TRACE, path })
    return this
  }
}

export { MethodRegisterer }
