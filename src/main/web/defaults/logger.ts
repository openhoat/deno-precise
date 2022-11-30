import {
  BuildConsoleStream,
  BuildLogger,
  BuildTokenReplacer,
} from '../../types/web/defaults/logger.d.ts'
import { camelCase } from '../../deps/x/camelcase.ts'
import {
  ConsoleStream,
  Logger,
  TokenReplacer,
  longestLevelName,
  nameToLevel,
} from '../../deps/x/optic.ts'

const buildConsoleStream: BuildConsoleStream = (options) =>
  Object.freeze(
    new ConsoleStream()
      .withFormat(_internals.buildTokenReplacer(options))
      .withLogHeader(false)
      .withLogFooter(false),
  )

const buildLogger: BuildLogger = (options) => {
  const logLevel = nameToLevel(
    camelCase(Deno.env.get('LOG_LEVEL') ?? 'debug', { pascalCase: true }),
  )
  const consoleStream = _internals.buildConsoleStream(options)
  return Object.freeze(new Logger(options?.name).addStream(consoleStream).withMinLogLevel(logLevel))
}

const buildTokenReplacer: BuildTokenReplacer = (options) => {
  const formatFields = [
    '{dateTime}',
    '[{level}]',
    options?.name && `[${options.name}]`,
    '{msg}',
  ].filter((field) => !!field)
  return Object.freeze(
    new TokenReplacer()
      .withFormat(formatFields.join(' '))
      .withDateTimeFormat('ss:SSS')
      .withLevelPadding(longestLevelName())
      .withColor(),
  )
}

const _internals = {
  buildConsoleStream,
  buildTokenReplacer,
}

export { _internals, buildLogger }
