import { camelCase, EventEmitter, getFreePort, Logger } from '../../../deps.ts'
import type { Routerable } from '../types/web/router.d.ts'
import type {
  ErrorHandler,
  HttpMethodSpec,
  NamedRouteHandler,
  NotFoundHandler,
  RequestHandler,
  RequestHandlerResult,
  RequestHandlerSpec,
  ResolvedRequestHandlerResult,
} from '../types/web/utils.d.ts'
import type { StaticWebServerable, WebServerable, WebServerOptions } from '../types/web/server.d.ts'
import { asPromise, isDefinedObject, staticImplements, toNumber, toResponse } from '../helper.ts'
import { defaults } from './defaults.ts'
import { hostnameForDisplay, HttpMethodSpecs } from './utils.ts'
import { isRouter } from './router.ts'

@staticImplements<StaticWebServerable>()
class WebServer extends EventEmitter implements WebServerable {
  #bindedPort?: number
  #errorHandler: ErrorHandler = defaults.errorHandler
  #notFoundHandler: NotFoundHandler = defaults.notFoundHandler
  readonly #options?: WebServerOptions
  #routeHandlers?: NamedRouteHandler[]
  readonly #requestHandlerSpecs: RequestHandlerSpec[] = []
  readonly #routers: Routerable[] = []
  #server?: Deno.Listener
  readonly logger: Readonly<Logger>

  constructor(options?: WebServerOptions) {
    super()
    this.logger = options?.logger ?? defaults.buildLogger()
    this.logger.info('Create web server')
    this.#options = options
    if (options?.errorHandler) {
      this.setErrorHandler(options.errorHandler)
    }
    if (options?.notFoundHandler) {
      this.setNotFoundHandler(options.notFoundHandler)
    }
    if (options?.handlers) {
      options.handlers.forEach((handler) => {
        this.register(handler)
      })
    }
  }

  get port(): number | undefined {
    return this.#bindedPort
  }

  get started(): boolean {
    return isDefinedObject(this.#server)
  }

  #accept() {
    this.logger.info('Accept connection')
    this.#waitFor('connection', async (server) => {
      try {
        const conn = await server.accept()
        this.#handleConn(conn).catch((err) => {
          this.emit('error', err)
        })
      } catch (err) {
        if (err instanceof Deno.errors.BadResource) {
          this.logger.warn(err.message)
          return false
        }
        throw err
      }
    })
      .then(() => {
        this.emit('closed')
      })
      .catch((err) => {
        this.emit('error', err)
      })
  }

  #applyRequestHandler(
    requestEvent: Deno.RequestEvent,
    requestHandler: NamedRouteHandler,
    responseSent: boolean,
  ): Promise<boolean> {
    const { request } = requestEvent
    let result: RequestHandlerResult
    try {
      result = requestHandler.handler(request, responseSent)
    } catch (err) {
      result = this.#errorHandler(request, err, responseSent)
    }
    return this.#handleResponse(requestEvent, requestHandler.name, result, responseSent)
  }

  #buildRouteHandler({
    handler,
    handlerName,
    methodToMatch,
    pathname,
    urlPattern,
  }: {
    handler: RequestHandler
    handlerName: string
    methodToMatch: HttpMethodSpec
    pathname: string | undefined
    urlPattern: URLPattern | undefined
  }): RequestHandler {
    return (req, responseSent) => {
      const { pathname: requestPathname } = new URL(req.url)
      const urlMatch = urlPattern ? urlPattern.exec({ pathname: requestPathname }) : true
      const methodMatch = methodToMatch === HttpMethodSpecs.ALL || req.method === methodToMatch
      const requestMatch = methodMatch && urlMatch
      if (!requestMatch) {
        this.logger.debug(
          `Request '${req.method} ${requestPathname}' does not match route '${methodToMatch} ${
            pathname || '*'
          }': ignore '${handlerName}'`,
        )
        return
      }
      if (urlMatch !== true && urlMatch.pathname.groups) {
        req.params = urlMatch.pathname.groups
      }
      this.logger.debug(
        `Request '${req.method} ${requestPathname}' matches route '${methodToMatch} ${
          pathname || '*'
        }': apply '${handlerName}'`,
      )
      return handler.call(this, req, responseSent)
    }
  }

  async #handleConn(conn: Deno.Conn) {
    this.logger.info('Handle connection')
    const httpConn = Deno.serveHttp(conn)
    this.once('closing', () => {
      httpConn.close()
    })
    await this.#waitFor(`request in connection#${conn.rid}`, async () => {
      const requestEvent = await httpConn.nextRequest()
      if (!requestEvent) {
        this.logger.debug(`No more request pending for connection#${conn.rid}`)
        return false
      }
      await this.#handleRequest(requestEvent)
    })
  }

  async #handleRequest(requestEvent: Deno.RequestEvent) {
    this.logger.info('Handle request')
    const routeHandlers = this.#routeHandlers
    const responseSent =
      routeHandlers?.length &&
      (await routeHandlers.reduce(async (promise, requestHandler) => {
        const responseSent = await promise
        return this.#applyRequestHandler(requestEvent, requestHandler, responseSent)
      }, Promise.resolve(false)))
    if (!responseSent) {
      this.logger.debug('No response sent by routes: fallback to not found handler')
      await this.#applyRequestHandler(
        requestEvent,
        { handler: this.#notFoundHandler, name: this.#notFoundHandler.name },
        false,
      )
    }
  }

  async #handleResponse(
    requestEvent: Deno.RequestEvent,
    requestHandlerName: string,
    requestHandlerResult: RequestHandlerResult,
    responseSent: boolean,
  ): Promise<boolean> {
    const resolvedResult: ResolvedRequestHandlerResult = await asPromise(requestHandlerResult)
    if (!resolvedResult) {
      return responseSent
    }
    if (responseSent) {
      this.logger.warn(
        `Error in request handler '${requestHandlerName}': response has already been sent`,
      )
      return responseSent
    }
    const response = toResponse(resolvedResult)
    if (response) {
      await requestEvent.respondWith(response)
    }
    return true
  }

  #prepareRouteHandlers() {
    this.#routers.forEach((router) => {
      router.registerToServer(this)
    })
    this.#routeHandlers = this.#requestHandlerSpecs.map((requestHandlerSpec) =>
      this.#toNamedRouteHandler(requestHandlerSpec),
    )
  }

  #registerRequestHandler(requestHandlerSpec: RequestHandlerSpec) {
    this.#requestHandlerSpecs.push(requestHandlerSpec)
  }

  #registerRouter(router: Routerable) {
    this.#routers.push(router)
  }

  #toNamedRouteHandler(requestHandlerSpec: RequestHandlerSpec): NamedRouteHandler {
    const {
      handler,
      method,
      name = requestHandlerSpec.handler.name,
      path: pathname,
    } = requestHandlerSpec
    const urlPattern = pathname ? new URLPattern({ pathname }) : undefined
    const methodToMatch = urlPattern ? method || HttpMethodSpecs.GET : HttpMethodSpecs.ALL
    const handlerName =
      name || camelCase(`${methodToMatch}_${(pathname || 'all').replaceAll('/', '_')}_handler`)
    this.logger.info(`Register '${handlerName}' on route '${methodToMatch} ${pathname || '*'}'`)
    const routeHandler: RequestHandler = this.#buildRouteHandler({
      handler,
      handlerName,
      methodToMatch,
      pathname,
      urlPattern,
    })
    return { handler: routeHandler, name: handlerName }
  }

  async #waitFor(
    name: string,
    cb: (server: Deno.Listener) => Promise<void | boolean>,
  ): Promise<void> {
    const server = this.#server
    while (true) {
      if (!server) {
        break
      }
      this.logger.info(`Waiting for new ${name}`)
      try {
        const result = await cb(server)
        if (result === false) {
          break
        }
      } catch (err) {
        this.emit('error', err)
        break
      }
    }
    this.logger.info(`End processing ${name}`)
  }

  register(requestHandlerSpecOrRouter: RequestHandlerSpec | Routerable): WebServerable {
    if (isRouter(requestHandlerSpecOrRouter)) {
      this.#registerRouter(requestHandlerSpecOrRouter)
    } else {
      this.#registerRequestHandler(requestHandlerSpecOrRouter)
    }
    return this
  }

  setErrorHandler(errorHandler: ErrorHandler) {
    this.logger.debug(`Set error handler (name: ${errorHandler.name})`)
    this.#errorHandler = errorHandler
  }

  setNotFoundHandler(notFoundHandler: NotFoundHandler) {
    this.logger.debug(`Set not found handler (name: ${notFoundHandler.name})`)
    this.#notFoundHandler = notFoundHandler
  }

  async start() {
    this.logger.info('Start server')
    if (this.started) {
      throw new Error('Server is already started')
    }
    const port =
      toNumber(Deno.env.get('PORT')) ?? (await getFreePort(this.#options?.port ?? defaults.port))
    const listenOptions = { hostname: this.#options?.hostname ?? '0.0.0.0', port }
    this.logger.debug(`Trying to bind: ${JSON.stringify(listenOptions)}`)
    this.#server = Deno.listen(listenOptions)
    this.#bindedPort = port
    this.#prepareRouteHandlers()
    this.#accept()
    this.logger.info(
      `Web server running. Access it at: http://${hostnameForDisplay(this.#options?.hostname)}:${
        this.#bindedPort
      }/`,
    )
  }

  async stop() {
    this.logger.info('Stop server')
    const server = this.#server
    if (!isDefinedObject(server)) {
      throw new Error('Server is not started')
    }
    await new Promise<void>((resolve) => {
      this.emit('closing')
      server.close()
      this.#server = undefined
      this.once('closed', () => {
        resolve()
      })
    })
  }
}

export { WebServer }
