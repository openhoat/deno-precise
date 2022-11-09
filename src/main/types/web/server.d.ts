import type { EventEmitter, Logger } from '../../../../deps.ts'
import type {
  ErrorHandler,
  NamedRequestHandler,
  NotFoundHandler,
  RequestHandlerResult,
  RequestHandlerSpec,
} from './utils.d.ts'

export type WebServerOptions = Partial<{
  errorHandler: ErrorHandler
  hostname: string
  notFoundHandler: NotFoundHandler
  logger: Logger
  port: number
  requestHandlerSpecs: RequestHandlerSpec[]
}>

export interface StaticWebServerable {
  new (options?: WebServerOptions): WebServerable
}

export interface WebServerable extends EventEmitter {
  readonly logger: Readonly<Logger>
  readonly port: number | undefined
  readonly started: boolean

  accept(): void

  applyRequestHandler(
    requestEvent: Deno.RequestEvent,
    requestHandler: NamedRequestHandler,
    responseSent: boolean,
  ): Promise<boolean>

  handleConn(conn: Deno.Conn): Promise<void>

  handleRequest(requestEvent: Deno.RequestEvent): Promise<void>

  handleResponse(
    requestEvent: Deno.RequestEvent,
    requestHandlerName: string,
    requestHandlerResult: RequestHandlerResult,
    responseSent: boolean,
  ): Promise<boolean>

  register(options: RequestHandlerSpec): WebServerable

  setNotFoundHandler(notFoundHandler: NotFoundHandler): void

  start(): Promise<void>

  stop(): Promise<void>

  waitFor(name: string, cb: (server: Deno.Listener) => Promise<void | boolean>): Promise<void>
}
