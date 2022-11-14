import { dirname, fromFileUrl, join, resolve } from '../../../deps/std.ts'
import { Accepts } from '../../../deps/x/accepts.ts'
import {
  ConsoleStream,
  Level,
  Logger,
  longestLevelName,
  TokenReplacer,
} from '../../../deps/x/optic.ts'
import type { WebServerDefaults } from '../types/web/defaults.d.ts'
import type { ErrorHandler, NotFoundHandler } from '../types/web/utils.d.ts'

const __dirname = dirname(fromFileUrl(import.meta.url))
const baseDir = resolve(__dirname, '..', '..', '..')

const buildLogger = () =>
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
  )

const errorHandler: ErrorHandler = (req, err, context) => {
  if (context.result) {
    return
  }
  return new Response(`Error encountered in request '${req.method} ${req.url}': ${err.message}.`, {
    status: 500,
  })
}

const notFoundHandler: NotFoundHandler = async (req: Request) => {
  const accept = new Accepts(req.headers)
  const types = accept.types(['html', 'json', 'text'])
  switch (types) {
    case 'json':
      return Response.json(
        { error: `Resource '${req.method} ${req.url}' not found.` },
        { status: 404 },
      )
    case 'text':
      return new Response(`Resource '${req.method} ${req.url}' not found.`, { status: 404 })
    case 'html':
    default: {
      const tplContent = await Deno.readTextFile(join(baseDir, 'assets', 'not-found.html'))
      type AvailableKey = 'method' | 'url'
      const keys: AvailableKey[] = ['method', 'url']
      const html = keys.reduce(
        (content, key) => content.replace(new RegExp(`{{\s*${key}\s*}}`), req[key]),
        tplContent,
      )
      return new Response(html, { headers: { 'Content-Type': 'text/html' }, status: 404 })
    }
  }
}

const defaults: Readonly<WebServerDefaults> = Object.freeze({
  buildLogger,
  errorHandler,
  notFoundHandler,
  port: 8000,
})

export { defaults }
