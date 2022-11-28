import type { ConsoleStream, Logger, TokenReplacer } from '../../deps/x/optic.ts'
import type { ErrorHandler, NotFoundHandler } from './web-server.d.ts'

export type BuildConsoleStream = (options?: { name?: string }) => Readonly<ConsoleStream>

export type BuildLogger = (options?: { name?: string }) => Readonly<Logger>

export type BuildTokenReplacer = (options?: { name?: string }) => Readonly<TokenReplacer>

export interface WebServerDefaults {
  buildLogger: BuildLogger
  errorHandler: ErrorHandler
  notFoundHandler: NotFoundHandler
  port: number
}
