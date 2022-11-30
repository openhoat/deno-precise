import type { Handler } from '../deps/std.ts'
import { Server } from '../deps/std.ts'
import { Logger } from '../deps/x/optic.ts'
import type {
  BaseWebServerable,
  BaseWebServerOptions,
  BaseWebServerStartOptions,
} from '../types/web/base-web-server.d.ts'
import { isNetAddr, toNumber } from '../helper.ts'
import defaults from './defaults/index.ts'

class BaseWebServer implements BaseWebServerable {
  #binded?: Deno.NetAddr
  readonly #options?: BaseWebServerOptions
  readonly #prepareHandler: (this: BaseWebServerable) => Handler
  #servePromise?: Promise<void>
  #server?: Server
  readonly logger: Readonly<Logger>

  constructor(
    prepareHandler: (this: BaseWebServerable) => Handler,
    options?: BaseWebServerOptions,
  ) {
    this.#prepareHandler = prepareHandler
    this.logger = options?.logger ?? defaults.buildLogger({ name: options?.name })
    this.logger.info('Create web server')
    this.#options = options
  }

  get hostname(): string | undefined {
    return this.#binded?.hostname
  }

  get port(): number | undefined {
    return this.#binded?.port
  }

  get started(): boolean {
    return !!this.#server && !this.#server.closed
  }

  async start(options?: BaseWebServerStartOptions) {
    this.logger.info('Start web server')
    if (this.started) {
      throw new Error('Server is already started')
    }
    const hostname = this.#options?.hostname
    const port = toNumber(Deno.env.get('PORT')) ?? this.#options?.port ?? defaults.port
    this.logger.debug(`Trying to bind: port=${port} hostname=${hostname}`)
    const listener = Deno.listen({ hostname, port })
    const binded = isNetAddr(listener.addr) ? listener.addr : undefined
    if (binded) {
      this.#binded = binded
      this.logger.debug(`Successfuly binded: port=${binded.port} hostname=${binded.hostname}`)
    }
    const handler = this.#prepareHandler()
    const server = new Server({ handler })
    this.logger.info(
      `Web server running. Access it at: http://${hostnameForDisplay(hostname)}:${port}/`,
    )
    this.#server = server
    const servePromise = server.serve(listener)
    if (options?.syncServe) {
      await servePromise
      return
    }
    this.#servePromise = servePromise
  }

  async stop() {
    this.logger.info('Stop web server')
    const server = this.#server
    if (!server || server.closed) {
      throw new Error('Server is not started')
    }
    server.close()
    await this.#servePromise
    this.#server = undefined
    this.#servePromise = undefined
  }
}

/**
 * Return a valid hostname string to connect to, in case the given hostname is '0.0.0.0'.
 * @param {string} hostname
 * @returns {string} hostname or 'localhost' if given hostname is '0.0.0.0'
 */
const hostnameForDisplay = (hostname?: string): string => {
  // If the hostname is "0.0.0.0", we display "localhost" in console
  // because browsers in Windows don't resolve "0.0.0.0".
  // See the discussion in https://github.com/denoland/deno_std/issues/1165
  return !hostname || hostname === '0.0.0.0' ? 'localhost' : hostname
}

export { BaseWebServer, hostnameForDisplay }
