import type { EventEmitter, Logger } from '../../../deps.ts'
import { NamedRequestHandler, RequestHandlerOptions } from './utils.d.ts'

export type WebServerOptions = Partial<{
  logger: Logger
  port: number
  hostname: string
}>

export interface WebServerDefaults {
  buildLogger: () => Logger
  port: number
  serverRequestHandlers: NamedRequestHandler[]
}

export interface StaticWebServerable {
  readonly defaults: WebServerDefaults

  new (options?: WebServerOptions): WebServerable
}

export interface WebServerable extends EventEmitter {
  readonly logger: Logger
  readonly port: number | undefined
  readonly started: boolean

  accept(): void

  handleConn(conn: Deno.Conn): Promise<void>

  handleRequest(requestEvent: Deno.RequestEvent): Promise<void>

  register(options: RequestHandlerOptions): WebServerable

  start(): Promise<void>

  stop(): Promise<void>

  waitFor(name: string, cb: (server: Deno.Listener) => Promise<void | boolean>): Promise<void>
}
