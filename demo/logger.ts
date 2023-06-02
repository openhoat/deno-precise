import {
  ConsoleStream,
  Level,
  Logger,
  longestLevelName,
  TokenReplacer,
} from './deps/x/optic.ts'

const levelPadding = longestLevelName()
const tokenReplacer = new TokenReplacer()
  .withFormat('{level} - {msg}')
  .withLevelPadding(levelPadding)
  .withColor()
const consoleStream = new ConsoleStream()
  .withFormat(tokenReplacer)
  .withLogHeader(false)
  .withLogFooter(false)
const logger = new Logger().withMinLogLevel(Level.Debug).addStream(
  consoleStream,
)

export default logger
