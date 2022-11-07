import {
  ConsoleStream,
  EventEmitter,
  getFreePort,
  Level,
  Logger,
  longestLevelName,
  TokenReplacer,
} from '../../deps.ts'
import type {
  NamedRequestHandler,
  RequestHandler,
  RequestHandlerOptions,
} from '../types/web/utils.d.ts'
import type { WebServerable, WebServerDefaults, WebServerOptions } from '../types/web/server.d.ts'
import { StaticWebServerable } from '../types/web/server.d.ts'
import { isDefinedObject, staticImplements, toNumber } from '../helper.ts'
import {
  defaultNotFoundRequestHandler,
  hostnameForDisplay,
  HttpMethods,
  isRequestHandlerResultPromise,
  toNamedRequestHandler,
} from './utils.ts'

@staticImplements<StaticWebServerable>()
class WebServer extends EventEmitter {
  static readonly defaults: WebServerDefaults = Object.freeze({
    buildLogger: () =>
      new Logger()
        .withMinLogLevel(Level.Debug)
        .addStream(
          new ConsoleStream().withFormat(
            new TokenReplacer()
              .withFormat('{dateTime} [{level}] {msg}')
              .withDateTimeFormat('ss:SSS')
              .withLevelPadding(longestLevelName())
              .withColor(),
          ),
        ),
    port: 3000,
    serverRequestHandlers: [toNamedRequestHandler(defaultNotFoundRequestHandler)],
  })

  readonly #options?: WebServerOptions
  readonly #requestHandlers: NamedRequestHandler[] = []
  #server?: Deno.Listener
  #serverRequestHandlers: NamedRequestHandler[]
  #bindedPort?: number
  readonly logger: Logger

  constructor(options?: WebServerOptions) {
    super()
    this.logger = options?.logger ?? WebServer.defaults.buildLogger()
    this.logger.info('Create API server')
    this.#options = options
    this.#serverRequestHandlers = WebServer.defaults.serverRequestHandlers
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

  async handleRequest(requestEvent: Deno.RequestEvent) {
    this.logger.info('Handle request')
    const { request } = requestEvent
    await this.#serverRequestHandlers.reduce(async (promise, { handler, name }) => {
      const responseSent = await promise
      const result = handler(request, responseSent)
      const response = isRequestHandlerResultPromise(result) ? await result : result
      if (!response) {
        return responseSent
      }
      if (responseSent) {
        this.logger.warn(`Error in request handler ${name}: response has already been sent`)
        return responseSent
      }
      await requestEvent.respondWith(response)
      return true
    }, Promise.resolve(false))
  }

  register(options: RequestHandlerOptions): WebServerable {
    const {
      handler,
      method = HttpMethods.GET,
      name = options.handler.name,
      path: pathname,
    } = options
    this.logger.info(`Register '${name}' with route ${method} ${pathname}`)
    const urlPattern = new URLPattern({ pathname })
    const routeHandler: RequestHandler = (req, responseSent) => {
      const { pathname: requestPathname } = new URL(req.url)
      const match = req.method === method && urlPattern.test({ pathname: requestPathname })
      if (!match) {
        this.logger.debug(
          `Request pathname '${requestPathname}' does not match '${pathname}': ignore request handler '${name}'`,
        )
        return
      }
      this.logger.debug(
        `Request pathname '${requestPathname}' matches '${pathname}': apply request handler '${name}'`,
      )
      return handler(req, responseSent)
    }
    this.#requestHandlers.push({ handler: routeHandler, name })
    return this
  }

  async start() {
    this.logger.info('Start server')
    if (this.started) {
      throw new Error('Server is already started')
    }
    const port = await getFreePort(
      this.#options?.port ?? toNumber(Deno.env.get('PORT')) ?? WebServer.defaults.port,
    )
    this.#server = Deno.listen({ hostname: this.#options?.hostname, port })
    this.#bindedPort = port
    this.#serverRequestHandlers = [
      ...this.#requestHandlers,
      toNamedRequestHandler(defaultNotFoundRequestHandler),
    ]
    for (const serverRequestHandler of this.#serverRequestHandlers) {
      this.logger.info(`Apply server request handler '${serverRequestHandler.name}'`)
    }
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
      this.#serverRequestHandlers = WebServer.defaults.serverRequestHandlers
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
