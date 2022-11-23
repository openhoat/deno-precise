import {
  ConsoleStream,
  Logger,
  longestLevelName,
  nameToLevel,
  TokenReplacer,
} from './deps/x/optic.ts'

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
