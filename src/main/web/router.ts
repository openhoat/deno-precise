import type { Routerable, RouterOptions } from '../types/web/router.d.ts'
import type { WebServerable } from '../types/web/server.d.ts'
import type { RequestHandler, RequestHandlerSpec } from '../types/web/utils.d.ts'
import { HttpMethodSpecs } from './utils.ts'

const isRouter = (o: unknown): o is Routerable => o instanceof Router

class Router implements Routerable {
  #routers: Routerable[] = []
  #requestHandlerSpecs: RequestHandlerSpec[] = []
  readonly prefix: string

  constructor(options?: RouterOptions) {
    this.prefix = options?.prefix ?? ''
  }

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

  trace(path: string, handler: RequestHandler) {
    this.register({ handler, method: HttpMethodSpecs.TRACE, path })
    return this
  }

  register(requestHandlerOrRouter: RequestHandlerSpec | Routerable) {
    if (isRouter(requestHandlerOrRouter)) {
      this.#routers.push(requestHandlerOrRouter)
    } else {
      this.#requestHandlerSpecs.push(requestHandlerOrRouter)
    }
    return this
  }

  registerToServer(server: WebServerable, prefix = '') {
    this.#routers.forEach((router) => {
      router.registerToServer(server, prefix.concat(this.prefix))
    })
    this.#requestHandlerSpecs.forEach((requestHandlerSpec) => {
      server.register({
        ...requestHandlerSpec,
        path: prefix.concat(this.prefix, requestHandlerSpec.path ?? ''),
      })
    })
  }
}

export { Router, isRouter }
