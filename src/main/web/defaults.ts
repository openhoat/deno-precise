import type { WebServerDefaults } from '../types/web/defaults.d.ts'
import { Logger } from 'optic/logger/logger.ts'
import { Level, longestLevelName } from 'optic/logger/levels.ts'
import { ConsoleStream } from 'optic/streams/consoleStream.ts'
import { TokenReplacer } from 'optic/formatters/tokenReplacer.ts'

const defaults: Readonly<WebServerDefaults> = Object.freeze({
  buildLogger: () =>
    Object.freeze(
      new Logger()
        .withMinLogLevel(Level.Debug)
        .addStream(
          new ConsoleStream().withFormat(
            new TokenReplacer()
              .withFormat('{dateTime} [{level}] {msg}')
              .withDateTimeFormat('ss:SSS')
              .withLevelPadding(longestLevelName())
              .withColor(),
          ),
        ),
    ),
  errorHandler: (req: Request, err: Error, responseSent: boolean) => {
    if (responseSent) {
      return
    }
    return new Response(
      `Error encountered in request '${req.method} ${req.url}': ${err.message}.`,
      { status: 500 },
    )
  },
  notFoundHandler: (req: Request) =>
    new Response(`Resource '${req.method} ${req.url}' not found.`, { status: 404 }),
  port: 8000,
})

export default defaults
