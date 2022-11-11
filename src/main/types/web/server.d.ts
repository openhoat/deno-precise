import type { Logger } from '../../../../deps.ts'
import type { Routerable } from './router.d.ts'
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

export interface WebServerable {
  readonly hostname: string | undefined
  readonly logger: Readonly<Logger>
  readonly port: number | undefined
  readonly started: boolean

  register(requestHandlerSpec: RequestHandlerSpec | Routerable): WebServerable

  setNotFoundHandler(notFoundHandler: NotFoundHandler): void

  start(): Promise<void>

  stop(): Promise<void>
}
