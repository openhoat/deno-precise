import type { WebServerDefaults } from '../../types/web/defaults/defaults.d.ts'
import { _internals as loggerInternals, buildLogger } from './logger.ts'
import { errorHandler } from './error-middleware.ts'
import { notFoundHandler } from './not-found-middleware.ts'

const defaults: Readonly<WebServerDefaults> = Object.freeze({
  buildConsoleStream: loggerInternals.buildConsoleStream,
  buildLogger,
  buildTokenReplacer: loggerInternals.buildTokenReplacer,
  errorHandler,
  notFoundHandler,
  port: 8000,
})

export default defaults
