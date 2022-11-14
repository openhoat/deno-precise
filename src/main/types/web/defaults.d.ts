import type { Logger } from '../../../../deps/x/optic.ts'
import type { ErrorHandler, NotFoundHandler } from './utils.d.ts'

export interface WebServerDefaults {
  buildLogger: () => Readonly<Logger>
  errorHandler: ErrorHandler
  notFoundHandler: NotFoundHandler
  port: number
}
