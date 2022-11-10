import { EventEmitter, getFreePort, Logger } from '../../../deps.ts'
import type {
  ErrorHandler,
  NamedRouteHandler,
  NotFoundHandler,
  RequestHandler,
  RequestHandlerResult,
  RequestHandlerSpec,
} from '../types/web/utils.d.ts'
import type { StaticWebServerable, WebServerable, WebServerOptions } from '../types/web/server.d.ts'
import { isDefinedObject, staticImplements, toNumber } from '../helper.ts'
import defaults from './defaults.ts'
import { hostnameForDisplay, HttpMethodSpecs, isRequestHandlerResultPromise } from './utils.ts'

@staticImplements<StaticWebServerable>()
class WebServer extends EventEmitter implements WebServerable {
  readonly #options?: WebServerOptions
  readonly #routeHandlers: NamedRouteHandler[] = []
  #server?: Deno.Listener
  #errorHandler: ErrorHandler = defaults.errorHandler
  #notFoundHandler: NotFoundHandler = defaults.notFoundHandler
  #bindedPort?: number
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

  accept() {
    this.logger.info('Accept connection')
    this.waitFor('connection', async (server) => {
      try {
        const conn = await server.accept()
        this.handleConn(conn).catch((err) => {
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

  applyRequestHandler(
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
    return this.handleResponse(requestEvent, requestHandler.name, result, responseSent)
  }

  async handleConn(conn: Deno.Conn) {
    this.logger.info('Handle connection')
    const httpConn = Deno.serveHttp(conn)
    this.once('closing', () => {
      httpConn.close()
    })
    await this.waitFor(`request in connection#${conn.rid}`, async () => {
      const requestEvent = await httpConn.nextRequest()
      if (!requestEvent) {
        this.logger.debug(`No more request pending for connection#${conn.rid}`)
        return false
      }
      await this.handleRequest(requestEvent)
    })
  }

  async handleResponse(
    requestEvent: Deno.RequestEvent,
    requestHandlerName: string,
    requestHandlerResult: RequestHandlerResult,
    responseSent: boolean,
  ): Promise<boolean> {
    const response = isRequestHandlerResultPromise(requestHandlerResult)
      ? await requestHandlerResult
      : requestHandlerResult
    if (!response) {
      return responseSent
    }
    if (responseSent) {
      this.logger.warn(
        `Error in request handler '${requestHandlerName}': response has already been sent`,
      )
      return responseSent
    }
    await requestEvent.respondWith(
      response instanceof Response ? response : Response.json(response),
    )
    return true
  }

  async handleRequest(requestEvent: Deno.RequestEvent) {
    this.logger.info('Handle request')
    const responseSent = await this.#routeHandlers.reduce(async (promise, requestHandler) => {
      const responseSent = await promise
      return this.applyRequestHandler(requestEvent, requestHandler, responseSent)
    }, Promise.resolve(false))
    if (!responseSent) {
      this.logger.debug('No response sent by routes: fallback to not found handler')
      await this.applyRequestHandler(
        requestEvent,
        { handler: this.#notFoundHandler, name: this.#notFoundHandler.name },
        false,
      )
    }
  }

  register(requestHandlerSpec: RequestHandlerSpec): WebServerable {
    const {
      handler,
      method,
      name = requestHandlerSpec.handler.name,
      path: pathname,
    } = requestHandlerSpec
    const urlPattern = pathname ? new URLPattern({ pathname }) : undefined
    const methodToMatch = urlPattern ? method || HttpMethodSpecs.GET : HttpMethodSpecs.ALL
    this.logger.info(`Register '${name}' on route '${methodToMatch} ${pathname || '*'}'`)
    const routeHandler: RequestHandler = (req, responseSent) => {
      const { pathname: requestPathname } = new URL(req.url)
      const urlMatch = urlPattern ? urlPattern.exec({ pathname: requestPathname }) : true
      const methodMatch = methodToMatch === HttpMethodSpecs.ALL || req.method === methodToMatch
      const requestMatch = methodMatch && urlMatch
      if (!requestMatch) {
        this.logger.debug(
          `Request '${req.method} ${requestPathname}' does not match route '${methodToMatch} ${
            pathname || '*'
          }': ignore handler '${name}'`,
        )
        return
      }
      if (urlMatch !== true && urlMatch.pathname.groups) {
        req.params = urlMatch.pathname.groups
      }
      this.logger.debug(
        `Request '${req.method} ${requestPathname}' matches route '${methodToMatch} ${
          pathname || '*'
        }': apply handler '${name}'`,
      )
      return handler.call(this, req, responseSent)
    }
    this.#routeHandlers.push({ handler: routeHandler, name })
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
    const port = await getFreePort(
      this.#options?.port ?? toNumber(Deno.env.get('PORT')) ?? defaults.port,
    )
    this.#server = Deno.listen({ hostname: this.#options?.hostname, port })
    this.#bindedPort = port
    this.accept()
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

  async waitFor(
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
}

export default WebServer
