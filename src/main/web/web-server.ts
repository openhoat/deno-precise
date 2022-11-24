import type { ConnInfo, Handler } from '../deps/std.ts'
import type { HttpMethodSpec } from '../types/web/http-method.d.ts'
import type { Routerable } from '../types/web/router.d.ts'
import type {
  ErrorHandler,
  Middleware,
  NamedRouteHandler,
  NotFoundHandler,
  OnSendHookHandler,
  RequestHandler,
  RequestHandlerContext,
  RequestHandlerResult,
  RequestHandlerSpec,
  ResolvedRequestHandlerResult,
  WebServerable,
  WebServerOptions,
} from '../types/web/web-server.d.ts'
import { asPromise, toArray, toResponse } from '../helper.ts'
import { defaults } from './defaults.ts'
import { isRouter } from './router.ts'
import { MethodRegisterer } from './method-registerer.ts'
import { HttpMethodSpecs } from './http-method.ts'
import { camelCase } from 'https://deno.land/x/camelcase@v2.1.0/mod.ts'
import { BaseWebServer } from './base-web-server.ts'
import { applyClassMixins } from 'https://deno.land/x/mixins@0.7.4/apply.ts'
import { BaseWebServerable, BaseWebServerStartOptions } from '../types/web/base-web-server.d.ts'

/**
 * Web server.
 */
class WebServer extends MethodRegisterer<WebServerable> implements WebServerable {
  #errorHandler: ErrorHandler = defaults.errorHandler
  #notFoundHandler: NotFoundHandler = defaults.notFoundHandler
  #onSendHookHandler?: OnSendHookHandler
  readonly #options?: WebServerOptions
  #routeHandlers?: NamedRouteHandler[]
  readonly #requestHandlerSpecs: RequestHandlerSpec[] = []
  readonly #routers: Routerable[] = []
  readonly #server: BaseWebServerable

  /**
   * Constructor.
   * @param {WebServerOptions} options
   * @returns {WebServerable} a new instance of web server
   */
  constructor(options?: WebServerOptions) {
    super()
    this.#server = new BaseWebServer(this.#prepareHandler.bind(this), options)
    this.#options = options
    if (options?.errorHandler) {
      this.setErrorHandler(options.errorHandler)
    }
    if (options?.notFoundHandler) {
      this.setNotFoundHandler(options.notFoundHandler)
    }
    if (options?.handlers) {
      toArray(options.handlers).forEach((handler) => {
        this.register(toMiddleware(handler))
      })
    }
  }

  get hostname() {
    return this.#server.hostname
  }

  get logger() {
    return this.#server.logger
  }

  get port() {
    return this.#server.port
  }

  get started() {
    return this.#server.started
  }

  #applyRequestHandler(
    req: Request,
    requestHandler: NamedRouteHandler,
    context: RequestHandlerContext,
  ): RequestHandlerResult {
    try {
      return requestHandler.handler(req, context)
    } catch (err) {
      return this.#errorHandler(req, err, context)
    }
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

  async #handleRequest(req: Request, connInfo: ConnInfo): Promise<ResolvedRequestHandlerResult> {
    this.logger.info('Handle request')
    const routeHandlers = this.#routeHandlers
    const result: RequestHandlerResult =
      routeHandlers?.length &&
      (await routeHandlers.reduce(async (promise, requestHandler) => {
        const lastResult = await asPromise(promise)
        const requestResult = await this.#applyRequestHandler(req, requestHandler, {
          connInfo,
          result: lastResult,
        })
        return requestResult ?? lastResult
      }, undefined as RequestHandlerResult))
    if (!result) {
      this.logger.debug('No response sent by routes: fallback to not found handler')
      return this.#applyRequestHandler(
        req,
        { handler: this.#notFoundHandler, name: this.#notFoundHandler.name },
        { connInfo },
      )
    }
    return result
  }

  #prepareHandler(): Handler {
    this.#prepareRouteHandlers()
    return async (req, connInfo): Promise<Response> => {
      const response = toResponse(await this.#handleRequest(req, connInfo))
      const onSendHookHandler = this.#onSendHookHandler
      const hookResponse =
        onSendHookHandler && (await asPromise(onSendHookHandler(response, req, connInfo)))
      const finalResponse = hookResponse || response
      return toResponse(finalResponse)
    }
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
    const handlerName = name || `${routeToString(methodToMatch, pathname)}Handler`
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

  setOnSendHook(hookHandler: OnSendHookHandler) {
    this.logger.debug(`Set 'onSend' hook (name: ${hookHandler.name})`)
    this.#onSendHookHandler = hookHandler
  }

  start(options?: BaseWebServerStartOptions) {
    return this.#server.start(options)
  }

  stop() {
    return this.#server.stop()
  }
}

applyClassMixins(WebServer, [MethodRegisterer])

/**
 * Return a string representation of a route.
 * @param {HttpMethodSpec} method
 * @param {string | undefined} pathname
 * @returns {string} string representation of the route
 */
const routeToString = (method: HttpMethodSpec, pathname: string | undefined): string =>
  camelCase(`${method}_${(pathname || 'all').replaceAll('/', '_')}`)

/**
 * Transform a middleware or a request handler to a middleware.
 * @param {Middleware | RequestHandler} handler
 * @returns {Middleware} if a request handler is given, returns a new minimal middleware, else returns the given middleware
 */
const toMiddleware = (handler: Middleware | RequestHandler): Middleware => {
  if (typeof handler === 'function') {
    return { handler }
  }
  return handler
}

export { WebServer, routeToString, toMiddleware }
