import type { BuildLogger, WebServerDefaults } from '../types/web/defaults.d.ts'
import type { ErrorHandler, NotFoundHandler } from '../types/web/web-server.d.ts'
import { Accepts } from '../deps/x/accepts.ts'
import {
  ConsoleStream,
  Logger,
  longestLevelName,
  nameToLevel,
  TokenReplacer,
} from '../deps/x/optic.ts'
import { camelCase } from 'https://deno.land/x/camelcase@v2.1.0/mod.ts'
import { BuildConsoleStream, BuildTokenReplacer } from '../types/web/defaults.d.ts'

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

const errorHandler: ErrorHandler = (req, err, context) => {
  if (context.result) {
    return
  }
  return new Response(`Error encountered in request '${req.method} ${req.url}': ${err.message}.`, {
    status: 500,
  })
}

const notFoundHandler: NotFoundHandler = (req: Request) => {
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
      type AvailableKey = 'method' | 'url'
      const keys: AvailableKey[] = ['method', 'url']
      const html = keys.reduce(
        (content, key) => content.replace(new RegExp(`{{\s*${key}\s*}}`), req[key]),
        notFoundHtmlTemplateContent,
      )
      return new Response(html, { headers: { 'Content-Type': 'text/html' }, status: 404 })
    }
  }
}

const notFoundHtmlTemplateContent = `
<!DOCTYPE html>
<html lang='en'>
  <head>
    <title>Resource not found</title>
    <style>
      body {
        height: 95vh;
        background: #fff;
        text-align: center;
        color: #101010;
        font-family: 'Fira Mono', monospace;
      }

      a,
      a:visited,
      a:hover,
      a:active {
        color: inherit;
      }
    </style>
  </head>
  <body>
    <div>
      <img
        alt='Precise logo'
        src='data:image/png;base64,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eG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICB4bWxuczpHSU1QPSJodHRwOi8vd3d3LmdpbXAub3JnL3htcC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOmViZWVlNzUyLTljMDctNDI2OC1hNTI1LTk0Yjg1YTMwNTU1ZCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2NjZmODRkZS05ZWRjLTRjODktOGNhYy02MWFmOWEyZWZmNzQiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2NWRjNGMxNS1lMTkwLTQ5ZTQtOWFlNC1jMjlmZTdiZDIxYzYiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJMaW51eCIKICAgR0lNUDpUaW1lU3RhbXA9IjE2NjgxMDQzOTU4MjU3OTgiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4zMiIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjI6MTE6MTBUMTk6MTk6NTUrMDE6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDIyOjExOjEwVDE5OjE5OjU1KzAxOjAwIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZDVlZTA5NmQtMTljMS00NWM2LThkOGUtZTVmNWFhNjQ5NzE3IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKExpbnV4KSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMi0xMS0xMFQxOToxOTo1NSswMTowMCIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz5PXzp7AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gsKEhM30lQQyQAAGfFJREFUeNrtnXuY1VW5xz8zs2eGuQGOiBcQBalEwAGjSJSLXBRDiyRLs5NRnUNK2Xk6p3wqT9opQ07qeU5ZesrUTnkKIrOjFKKgQoWOoVyEUWIQ5DKawzDcZvZc9v6dP9Ya3ez2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'
      />
      <h1>404 Error :(</h1>
      <h2>
        <a href='https://deno.land/x/precise'>Precise</a> did not find the requested resource:
      </h2>
      <h3>{{method}} {{url}}</h3>
    </div>
  </body>
</html>`

const defaults: Readonly<WebServerDefaults> = Object.freeze({
  buildLogger,
  errorHandler,
  notFoundHandler,
  port: 8000,
})

const _internals = {
  buildConsoleStream,
  buildTokenReplacer,
}

export { _internals, defaults }
