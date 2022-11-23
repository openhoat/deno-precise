import type { ConnInfo, Handler } from '../deps/std.ts'
import { Server } from '../deps/std.ts'
import { Logger } from '../deps/x/optic.ts'
import type { Routerable } from '../types/web/router.d.ts'
import type {
  ErrorHandler,
  HttpMethodSpec,
  NamedRouteHandler,
  NotFoundHandler,
  OnSendHookHandler,
  RequestHandler,
  RequestHandlerResult,
  RequestHandlerSpec,
  ResolvedRequestHandlerResult,
} from '../types/web/utils.d.ts'
import { RequestHandlerContext } from '../types/web/utils.d.ts'
import type {
  StaticWebServerable,
  WebServerable,
  WebServerOptions,
} from '../types/web/web-server.d.ts'
import { WebServerStartOptions } from '../types/web/web-server.d.ts'
import {
  asPromise,
  isDefinedObject,
  isNetAddr,
  staticImplements,
  toNumber,
  toResponse,
} from '../helper.ts'
import { defaults } from './defaults.ts'
import {
  hostnameForDisplay,
  HttpMethodSpecs,
  routeToString,
  toRequestHandlerSpecs,
} from './utils.ts'
import { isRouter } from './router.ts'
import { MethodRegisterer } from './method-registerer.ts'

@staticImplements<StaticWebServerable>()
class WebServer extends MethodRegisterer<WebServerable> implements WebServerable {
  #binded?: Deno.NetAddr
  #errorHandler: ErrorHandler = defaults.errorHandler
  #notFoundHandler: NotFoundHandler = defaults.notFoundHandler
  #onSendHookHandler?: OnSendHookHandler
  readonly #options?: WebServerOptions
  #routeHandlers?: NamedRouteHandler[]
  readonly #requestHandlerSpecs: RequestHandlerSpec[] = []
  readonly #routers: Routerable[] = []
  #servePromise?: Promise<void>
  #server?: Server
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
      toRequestHandlerSpecs(options.handlers).forEach((handler) => {
        this.register(handler)
      })
    }
  }

  get hostname(): string | undefined {
    return this.#binded?.hostname
  }

  get port(): number | undefined {
    return this.#binded?.port
  }

  get started(): boolean {
    return isDefinedObject(this.#server)
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

  async start(options?: WebServerStartOptions) {
    this.logger.info('Start server')
    if (this.started) {
      throw new Error('Server is already started')
    }
    const hostname = this.#options?.hostname
    const port = toNumber(Deno.env.get('PORT')) ?? this.#options?.port ?? defaults.port
    this.logger.debug(`Trying to bind: port=${port} hostname=${hostname}`)
    const listener = Deno.listen({ hostname, port })
    const binded = isNetAddr(listener.addr) ? listener.addr : undefined
    if (binded) {
      this.logger.debug(`Successfuly binded: port=${binded.port} hostname=${binded.hostname}`)
      this.#binded = binded
    }
    this.#prepareRouteHandlers()
    const handler: Handler = async (req, connInfo): Promise<Response> => {
      const response = toResponse(await this.#handleRequest(req, connInfo))
      const onSendHookHandler = this.#onSendHookHandler
      const hookResponse =
        onSendHookHandler && (await asPromise(onSendHookHandler(response, req, connInfo)))
      const finalResponse = hookResponse || response
      return toResponse(finalResponse)
    }
    const server = new Server({ handler })
    this.#server = server
    this.logger.info(
      `Web server running. Access it at: http://${hostnameForDisplay(hostname)}:${port}/`,
    )
    const servePromise = server.serve(listener)
    if (options?.syncServe) {
      await servePromise
      return
    }
    this.#servePromise = servePromise
  }

  async stop() {
    this.logger.info('Stop server')
    const server = this.#server
    if (!isDefinedObject(server)) {
      throw new Error('Server is not started')
    }
    server.close()
    await this.#servePromise
    this.#server = undefined
    this.#servePromise = undefined
  }
}

export { WebServer }
