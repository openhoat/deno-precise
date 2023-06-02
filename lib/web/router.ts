import type { Routerable, RouterOptions } from '../types/web/router.d.ts'
import type {
  Middleware,
  RequestHandlerSpec,
  WebServerable,
} from '../types/web/web-server.d.ts'
import { MethodRegisterer } from './method-registerer.ts'

const isRouter = (o: unknown): o is Routerable => o instanceof Router

class Router extends MethodRegisterer<Routerable> implements Routerable {
  #routers: Routerable[] = []
  #requestHandlerSpecs: RequestHandlerSpec[] = []
  readonly prefix: string

  constructor(options?: RouterOptions) {
    super()
    this.prefix = options?.prefix ?? ''
  }

  register(middleware: Middleware): Routerable {
    if (isRouter(middleware)) {
      this.#routers.push(middleware)
    } else {
      this.#requestHandlerSpecs.push(middleware)
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

export { isRouter, Router }
