import type { Middleware, Registerable, RequestHandler } from '../types/web/web-server.d.ts'
import { HttpMethodSpecs } from './http-method.ts'

abstract class MethodRegisterer<T> implements Registerable<T> {
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

  abstract register(middleware: Middleware): T

  trace(path: string, handler: RequestHandler) {
    this.register({ handler, method: HttpMethodSpecs.TRACE, path })
    return this
  }
}

export { MethodRegisterer }
