import type { ConsoleStream, Logger, TokenReplacer } from '../../../../deps/x/optic.ts'
import type { ErrorHandler, NotFoundHandler } from './utils.d.ts'

export type BuildLogger = () => Readonly<Logger>

export interface WebServerDefaults {
  consoleStream: Readonly<ConsoleStream>
  buildLogger: BuildLogger
  errorHandler: ErrorHandler
  notFoundHandler: NotFoundHandler
  port: number
  tokenReplacer: Readonly<TokenReplacer>
}
