import type { Logger } from '../../deps/x/optic.ts'
import type {
  ErrorHandler,
  MethodRegisterable,
  NotFoundHandler,
  OnSendHookHandler,
  Registerable,
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

export interface WebServerable
  extends Registerable<WebServerable>,
    MethodRegisterable<WebServerable> {
  readonly hostname: string | undefined
  readonly logger: Readonly<Logger>
  readonly port: number | undefined
  readonly started: boolean

  setErrorHandler(errorHandler: ErrorHandler): void

  setNotFoundHandler(notFoundHandler: NotFoundHandler): void

  setOnSendHook(hookHandler: OnSendHookHandler): void

  start(options?: WebServerStartOptions): Promise<void>

  stop(): Promise<void>
}
