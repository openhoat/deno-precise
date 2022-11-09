import type { Logger } from '../../../../deps.ts'
import type { ErrorHandler, NotFoundHandler } from './utils.d.ts'

export interface WebServerDefaults {
  buildLogger: () => Readonly<Logger>
  errorHandler: ErrorHandler
  notFoundHandler: NotFoundHandler
  port: number
}
