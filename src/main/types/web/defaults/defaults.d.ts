import type { ErrorHandler, NotFoundHandler } from '../web-server.d.ts'
import type { BuildLogger } from './logger.d.ts'

export interface WebServerDefaults {
  buildLogger: BuildLogger
  errorHandler: ErrorHandler
  notFoundHandler: NotFoundHandler
  port: number
}
