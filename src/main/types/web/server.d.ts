import type { EventEmitter, Logger } from '../../../../deps.ts'
import type { ErrorHandler, NotFoundHandler, RequestHandlerSpec } from './utils.d.ts'

export type WebServerOptions = Partial<{
  errorHandler: ErrorHandler
  handlers: RequestHandlerSpec[]
  hostname: string
  notFoundHandler: NotFoundHandler
  logger: Logger
  port: number
}>

export interface StaticWebServerable {
  new (options?: WebServerOptions): WebServerable
}

export interface WebServerable extends EventEmitter {
  readonly logger: Readonly<Logger>
  readonly port: number | undefined
  readonly started: boolean

  register(options: RequestHandlerSpec): WebServerable

  setNotFoundHandler(notFoundHandler: NotFoundHandler): void

  start(): Promise<void>

  stop(): Promise<void>
}
