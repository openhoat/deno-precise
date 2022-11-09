import { EventEmitter, getFreePort, Logger } from '../../../deps.ts'
import type {
  NamedRequestHandler,
  RequestHandler,
  RequestHandlerSpec,
} from '../types/web/utils.d.ts'
import { ErrorHandler, NotFoundHandler, RequestHandlerResult } from '../types/web/utils.d.ts'
import type { WebServerable, WebServerOptions } from '../types/web/server.d.ts'
import { StaticWebServerable } from '../types/web/server.d.ts'
import { isDefinedObject, staticImplements, toNumber } from '../helper.ts'
import defaults from './defaults.ts'
import { hostnameForDisplay, HttpMethods, isRequestHandlerResultPromise } from './utils.ts'

@staticImplements<StaticWebServerable>()
class WebServer extends EventEmitter implements WebServerable {
  readonly #options?: WebServerOptions
  readonly #requestHandlers: NamedRequestHandler[] = []
  #server?: Deno.Listener
  #errorHandler: ErrorHandler = defaults.errorHandler
  #notFoundHandler: NotFoundHandler = defaults.notFoundHandler
  #bindedPort?: number
  readonly logger: Readonly<Logger>

  constructor(options?: WebServerOptions) {
    super()
    this.logger = options?.logger ?? defaults.buildLogger()
    this.logger.info('Create API server')
    this.#options = options
    if (options?.errorHandler) {
      this.setErrorHandler(options.errorHandler)
    }
    if (options?.notFoundHandler) {
      this.setNotFoundHandler(options.notFoundHandler)
    }
    if (options?.requestHandlerSpecs) {
      options.requestHandlerSpecs.forEach((requestHandlerSpec) => {
        this.register(requestHandlerSpec)
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
    requestHandler: NamedRequestHandler,
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
    await requestEvent.respondWith(response)
    return true
  }

  async handleRequest(requestEvent: Deno.RequestEvent) {
    this.logger.info('Handle request')
    const responseSent = await this.#requestHandlers.reduce(async (promise, requestHandler) => {
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
      method = HttpMethods.GET,
      name = requestHandlerSpec.handler.name,
      path: pathname,
    } = requestHandlerSpec
    this.logger.info(`Register '${name}' with route ${method} ${pathname}`)
    const urlPattern = new URLPattern({ pathname })
    const routeHandler: RequestHandler = (req, responseSent) => {
      const { pathname: requestPathname } = new URL(req.url)
      const match = req.method === method && urlPattern.exec({ pathname: requestPathname })
      if (!match) {
        this.logger.debug(
          `Request pathname '${requestPathname}' does not match '${pathname}': ignore request handler '${name}'`,
        )
        return
      }
      req.params = match.pathname.groups
      this.logger.debug(
        `Request pathname '${requestPathname}' matches '${pathname}': apply request handler '${name}'`,
      )
      return handler(req, responseSent)
    }
    this.#requestHandlers.push({ handler: routeHandler, name })
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
