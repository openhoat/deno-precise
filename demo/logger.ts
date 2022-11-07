import { longestLevelName, nameToLevel } from 'optic/logger/levels.ts'
import { Logger } from 'optic/logger/logger.ts'
import { ConsoleStream } from 'optic/streams/consoleStream.ts'
import { TokenReplacer } from 'optic/formatters/tokenReplacer.ts'

const logLevel = nameToLevel(Deno.env.get('LOG_LEVEL') ?? 'Debug')
const levelPadding = longestLevelName()
const logger = new Logger()
  .withMinLogLevel(logLevel)
  .addStream(
    new ConsoleStream().withFormat(
      new TokenReplacer()
        .withFormat('{dateTime} [{level}] {msg}')
        .withDateTimeFormat('DD hh:mm:ss:SSS')
        .withLevelPadding(levelPadding)
        .withColor(),
    ),
  )

export default logger
