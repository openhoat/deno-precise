import type { Logger } from '../../../../deps/x/optic.ts'
import type { Routerable } from './router.d.ts'
import type {
  ErrorHandler,
  NotFoundHandler,
  RequestHandler,
  RequestHandlerSpec,
} from './utils.d.ts'

export type WebServerOptions = Partial<{
  errorHandler: ErrorHandler
  handlers: RequestHandlerSpec[] | RequestHandlerSpec | RequestHandler
  hostname: string
  notFoundHandler: NotFoundHandler
  logger: Logger
  port: number
}>

export interface StaticWebServerable {
  new (options?: WebServerOptions): WebServerable
}

export type WebServerStartOptions = Partial<{ syncServe: boolean }>

export interface WebServerable {
  readonly hostname: string | undefined
  readonly logger: Readonly<Logger>
  readonly port: number | undefined
  readonly started: boolean

  register(requestHandlerSpec: RequestHandlerSpec | Routerable): WebServerable

  setNotFoundHandler(notFoundHandler: NotFoundHandler): void

  start(options?: WebServerStartOptions): Promise<void>

  stop(): Promise<void>
}
