import type { Logger } from '../../deps/x/optic.ts'
import type { ErrorHandler, NotFoundHandler } from './web-server.d.ts'

export type BuildLogger = () => Readonly<Logger>

export interface WebServerDefaults {
  buildLogger: BuildLogger
  errorHandler: ErrorHandler
  notFoundHandler: NotFoundHandler
  port: number
}
