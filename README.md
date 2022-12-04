[![deno module](https://shield.deno.dev/x/precise)](https://deno.land/x/precise)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/precise/mod.ts)
[![CI](https://github.com/openhoat/deno-precise/actions/workflows/build.yml/badge.svg)](https://github.com/openhoat/deno-precise/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/openhoat/deno-precise/branch/main/graph/badge.svg?token=VFJ63YUYY0)](https://app.codecov.io/openhoat/openhoat/deno-precise)
[![vr scripts](https://badges.velociraptor.run/flat.svg)](https://velociraptor.run)
[![license](https://img.shields.io/github/license/openhoat/deno-precise)](https://github.com/openhoat/deno-precise/blob/master/LICENSE)

# Precise

A clean and easy web server powered by Deno.

## Getting started

### The stupid example

Let's start a totally useless web server!

[`demo/sample0.ts`](demo/sample0.ts):

```typescript
import { WebServer } from 'https://deno.land/x/precise/mod.ts'

await new WebServer().start()
```

> - No config / middleware / handler registered
> - The server will just apply the 'not found' fallback

Run the server:

```shell
$ deno run demo/sample0.ts
17:259 [Info    ] Create web server
17:259 [Info    ] Start web server
✅ Granted env access to "PORT".
✅ Granted net access to "0.0.0.0:8000".
19:164 [Debug   ] Trying to bind: port=8000 hostname=0.0.0.0
19:164 [Debug   ] Successfuly binded: port=8000 hostname=0.0.0.0
19:165 [Info    ] Web server running. Access it at: http://localhost:8000/
```

Request with a browser:

![404 default HTML page](assets/img/404-screenshot.png)

Request with a text plain compliant User Agent:

```shell
$ http :8000/badroute "Accept:text/plain"
HTTP/1.1 404 Not Found
content-encoding: gzip
content-length: 79
content-type: text/plain;charset=UTF-8
date: Thu, 10 Nov 2022 18:29:47 GMT
vary: Accept-Encoding

Resource 'GET http://localhost:8000/badroute' not found.

$ █
```

Request with a JSON compliant User Agent:

```shell
✗ http :8000/badroute "Accept:application/json"
HTTP/1.1 404 Not Found
content-encoding: gzip
content-length: 91
content-type: application/json
date: Thu, 10 Nov 2022 18:30:09 GMT
vary: Accept-Encoding

{
    "error": "Resource 'GET http://localhost:8000/badroute' not found."
}

$ █
```

### The minimal example

[`demo/sample1.ts`](demo/sample1.ts):

```typescript
import { WebServer } from 'https://deno.land/x/precise/mod.ts'

await new WebServer().get('/', () => ({ foo: 'bar' })).start()
```

> A request handler can return either:
>
> - nothing: the server will not send any response.
> - a [JSON literal object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer):
>   the server will send a JSON content HTTP response.
> - a [BodyInit](https://deno.land/api@v1.27.2?s=BodyInit): the server will send a wrapped response on top of the
>   provided body.
> - a [Response](https://deno.com/deploy/docs/runtime-response): the server will send the given response.
> - [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) of the aboves:
>   the server will resolve the promise and apply the aboves strategies.

Run the server:

```shell
$ deno run demo/sample1.ts
52:555 [Info    ] Create web server
52:555 [Info    ] Start web server
✅ Granted env access to "PORT".
✅ Granted net access to "0.0.0.0:8000".
54:220 [Debug   ] Trying to bind: port=8000 hostname=0.0.0.0
54:220 [Debug   ] Successfuly binded: port=8000 hostname=0.0.0.0
54:221 [Info    ] Register 'handler' on route 'GET /'
54:221 [Info    ] Web server running. Access it at: http://localhost:8000/
```

Request:

```shell
$ http :8000
HTTP/1.1 200 OK
content-length: 13
content-type: application/json
date: Wed, 09 Nov 2022 07:02:46 GMT
vary: Accept-Encoding

{
    "foo": "bar"
}

$ █
```

Server logs:

```text
…
38:225 [Info    ] Handle request
38:225 [Debug   ] Request 'GET /' matches route 'GET /': apply 'handler'
```

> There are several ways to register a route to the web server instance:
>
> - `register()` method
> - `get|post|put|…` alias method
> - `handlers` option of the constructor

## Why

This project has been created because of the lack of a stop method in Http Deno and the others third party modules.

I wanted a simple web server service, that starts, registers, and stops, and don't want to deal with 2 imbricated async
iterator loops ([serving-http](https://deno.land/manual@v1.26.2/runtime/http_server_apis_low_level#serving-http)).

This project was created with some strong principles in mind, which can be mainly summarized
by [DX](https://developerexperience.io/):

- Quality
- Testing
- Clean and easy understandable API
- Async / Promise compliant everywhere
- Robust: all is done to be sure that in any situation the server will have a fair behaviour and will report enough logs

## Deploy

Precise supports [Deno deploy](https://deno.com/deploy) out-of-the-box.

Live demo:

- hello route: [precise.deno.dev/hello](https://precise.deno.dev/hello)
- HTML file: [precise.deno.dev/assets/index.html](https://precise.deno.dev/assets/index.html)
- TXT file: [precise.deno.dev/assets/hello.txt](https://precise.deno.dev/assets/hello.txt)
- not found fallback: [precise.deno.dev/oops](https://precise.deno.dev/oops)

Have a look at the source: [`demo/deno_deploy.ts`](demo/deno_deploy.ts).

## Features

- [x] [Basic service lifecycle](#why)
- [x] [Route matching](#the-minimal-example)
- [x] [Signal handling](#signals-handling)
- [x] [Route params](#route-params)
- [x] [Middlewares](#middlewares)
- [x] [Routers](#routers)
- [x] [Logging](#logging)
- [x] [Assets / static files](#assets)
- [x] [Hooks](#hooks)
- [x] [Multi CPU cores](#multi-cpu-cores)

### Signals handling

Use signals handling to gracefully shutdown the web server.

[`demo/sample2.ts`](demo/sample2.ts):

```typescript
import { WebServer, shutdownOnSignals } from 'https://deno.land/x/precise/mod.ts'

const webServer = new WebServer()
shutdownOnSignals(webServer)
webServer.register({
  path: '/',
  handler: () => ({ foo: 'bar' }),
})
await webServer.start()
```

Run the server:

```shell
$ deno run demo/sample2.ts
26:867 [Info    ] Create web server
26:867 [Debug   ] Handling signal SIGINT
26:868 [Debug   ] Handling signal SIGTERM
26:868 [Debug   ] Handling signal SIGQUIT
26:868 [Info    ] Type 'kill -s SIGINT 52613' to stop
26:868 [Info    ] Start web server
✅ Granted env access to "PORT".
✅ Granted net access to "0.0.0.0:8000".
28:716 [Debug   ] Trying to bind: port=8000 hostname=0.0.0.0
28:716 [Debug   ] Successfuly binded: port=8000 hostname=0.0.0.0
28:716 [Info    ] Register 'handler' on route 'GET /'
28:716 [Info    ] Web server running. Access it at: http://localhost:8000/
```

Stop the server:

```shell
$ kill -s SIGINT 52613
$ █
```

Server logs:

```text
…
58:375 [Warn    ] Received signal SIGINT
58:376 [Info    ] Stop web server
58:378 [Info    ] Logging session complete.  Duration: 31511ms
$ █
```

> The server is properly stopped without the need to Deno.exit(),
> so that it can be used cleanly into end-to-end tests.

### Route params

Handle routes parameters:

[`demo/sample3.ts`](demo/sample3.ts):

```typescript
import { WebServer, shutdownOnSignals } from 'https://deno.land/x/precise/mod.ts'

const webServer = new WebServer()
shutdownOnSignals(webServer)
const { logger } = webServer
webServer.register({
  method: 'POST',
  path: '/execute/:cmd',
  handler: (req) => {
    if (req.params?.cmd === 'stop') {
      setTimeout(async () => {
        try {
          await webServer.stop()
        } catch (err) {
          logger.error(err)
          Deno.exit(1)
        }
      }, 1000)
      return new Response(undefined, { status: 202 })
    }
    return { foo: 'bar' }
  },
})

try {
  await webServer.start()
} catch (err) {
  logger.error(err)
  Deno.exit(1)
}
```

Request:

```shell
$ http post :8000/execute/stop
HTTP/1.1 202 Accepted
content-length: 0
date: Wed, 09 Nov 2022 08:37:53 GMT
vary: Accept-Encoding

$ █
```

Server logs:

```text
51:151 [Info    ] Handle request
51:151 [Debug   ] Request 'POST /execute/stop' matches route 'POST /execute/:cmd': apply 'handler'
52:154 [Info    ] Stop web server
52:156 [Info    ] Logging session complete.  Duration: 13450ms
$ █
```

### Fallbacks

In case of a not found resource or an error, defaults handler are applied.

Feel free to use custom not found and error handlers.

[`demo/sample4.ts`](demo/sample4.ts):

```typescript
import { WebServer } from 'https://deno.land/x/precise/mod.ts'

const webServer = new WebServer()
webServer.setErrorHandler((req, err, context) => {
  if (context.result) {
    return
  }
  return Response.json(
    {
      code: 'INTERNAL_SERVER',
      message: `Error encountered in request '${req.method} ${req.url}': ${err.message}.`,
    },
    { status: 500 },
  )
})
webServer.setNotFoundHandler((req) =>
  Response.json(
    {
      code: 'NOT_FOUND',
      message: `Resource '${req.method} ${req.url}' not found.`,
    },
    { status: 404 },
  ),
)
webServer.register({
  path: '/oops',
  handler: () => {
    throw new Error('oops')
  },
})

await webServer.start()
```

Request:

```shell
$ http :8000/myverybadroute
HTTP/1.1 404 Not Found
content-encoding: gzip
content-length: 112
content-type: application/json
date: Wed, 09 Nov 2022 15:49:01 GMT
vary: Accept-Encoding

{
  "code": "NOT_FOUND",
  "message": "Resource 'GET http://localhost:8000/myverybadroute' not found."
}

$ http :8000/oops
HTTP/1.1 500 Internal Server Error
content-encoding: gzip
content-length: 123
content-type: application/json
date: Wed, 09 Nov 2022 15:50:11 GMT
vary: Accept-Encoding

{
  "code": "INTERNAL_SERVER",
  "message": "Error encountered in request 'GET http://localhost:8000/oops': oops."
}

$ █
```

Or in a simpler all-in-one form, as in [`demo/sample5.ts`](demo/sample5.ts):

```typescript
import { WebServer } from 'https://deno.land/x/precise/mod.ts'

await new WebServer({
  errorHandler: (req, err, context) => {
    if (context.result) {
      return
    }
    return Response.json(
      {
        code: 'INTERNAL_SERVER',
        message: `Error encountered in request '${req.method} ${req.url}': ${err.message}.`,
      },
      { status: 500 },
    )
  },
  notFoundHandler: (req) =>
    Response.json(
      {
        code: 'NOT_FOUND',
        message: `Resource '${req.method} ${req.url}' not found.`,
      },
      { status: 404 },
    ),
  handlers: {
    path: '/oops',
    handler: () => {
      throw new Error('oops')
    },
  },
}).start()
```

### Middlewares

Route request handlers are part of a middlewares list enabled when the server is started.

The server will pass the request to each registered middleware in the order of their registration, then fallback to the
special 'not found' handler if no response was sent.

In case of error in any handler, the server will pass the request to the special error handler.

In the middlewares chain, each handler is executed, even if the response has already been sent ; it's the responsability
of the handler to check it and return sooner if the response was already sent.

To register a middleware handling all routes, simply omit the `path`.

[`demo/sample6.ts`](demo/sample6.ts):

```typescript
import { WebServer } from 'https://deno.land/x/precise/mod.ts'

await new WebServer({
  handlers: function allRoutesHandler(req) {
    this.logger.warn(`The request '${req.method} ${req.url}' was here!`)
    // Do something useful with the request
  },
}).start()
```

Request:

```shell
$ http :8000/ "Accept:text/plain"
HTTP/1.1 404 Not Found
content-encoding: gzip
content-length: 71
content-type: text/plain;charset=UTF-8
date: Fri, 11 Nov 2022 13:28:24 GMT
vary: Accept-Encoding

Resource 'GET http://localhost:8000/' not found.

$ █
```

Server logs:

```text
…
19:822 [Info    ] Handle request
19:822 [Debug   ] Request 'GET /' matches route 'ALL *': apply 'allRoutesHandler'
19:822 [Warn    ] The request 'GET http://localhost:8000/' was here!
19:822 [Debug   ] No response sent by routes: fallback to not found handler
```

> It's possible to add a `method` property to refine matching criteria.

### Routers

Use routers to better organize your routes with path prefixes.

[`demo/sample7.ts`](demo/sample7.ts):

```typescript
import { WebServer } from 'https://deno.land/x/precise/mod.ts'
import { apiRouter } from './api/api_router.ts'

const webServer = new WebServer()
webServer.register(apiRouter)
await webServer.start()
```

[`demo/api/api_router.ts`](demo/api/api_router.ts):

```typescript
import { Router } from 'https://deno.land/x/precise/mod.ts'
import { v1Router } from './v1/v1_router.ts'

const apiRouter = new Router({ prefix: '/api' })
apiRouter.register(v1Router)
apiRouter.get('/health', () => ({ ok: true }))

export { apiRouter }
```

[`demo/api/v1/v1_router.ts`](demo/api/v1/v1_router.ts):

```typescript
import { Router } from 'https://deno.land/x/precise/mod.ts'

const v1Router = new Router({ prefix: '/v1' })
v1Router.get('/foo', () => {
  return { foo: 'bar' }
})
v1Router.delete('/hello', () => {
  return { message: 'bye!' }
})

export { v1Router }
```

### Logging

The web server comes with an embedded default logger based on [optic](https://deno.land/x/optic).

If you need to customize logging, just pass your custom logger into the web server options.

[`demo/sample8.ts`](demo/sample8.ts):

```typescript
import { WebServer } from 'https://deno.land/x/precise/mod.ts'
import logger from './logger.ts'

const webServer = new WebServer({ logger })
await webServer.start()
```

[`demo/logger.ts`](demo/logger.ts):

```typescript
import { TokenReplacer } from 'https://deno.land/x/optic/formatters/tokenReplacer.ts'
import {
  ConsoleStream,
  Level,
  Logger,
  longestLevelName,
  TokenReplacer,
} from 'https://deno.land/x/optic/mod.ts'

const levelPadding = longestLevelName()
const tokenReplacer = new TokenReplacer()
  .withFormat('{level} - {msg}')
  .withLevelPadding(levelPadding)
  .withColor()
const consoleStream = new ConsoleStream()
  .withFormat(tokenReplacer)
  .withLogHeader(false)
  .withLogFooter(false)
const logger = new Logger().withMinLogLevel(Level.Debug).addStream(consoleStream)

export default logger
```

### Assets

Precise provides a middleware to serve static files, it takes a `root` folder and an optional `prefix`.

[`demo/sample9.ts`](demo/sample9.ts):

```typescript
import { dirname, fromFileUrl, resolve } from 'https://deno.land/std@0.166.0/path/mod.ts'
import { WebServer, assets } from 'https://deno.land/x/precise/mod.ts'

const __dirname = dirname(fromFileUrl(import.meta.url))
const assetsBaseDir = resolve(__dirname, 'assets')
const webServer = new WebServer()
webServer.register(assets({ root: assetsBaseDir }))
await webServer.start()
```

Browse [/assets/index.html](http://localhost:8000/assets/index.html):

> By default `index` options is `true` so that `/assets` is considered as an alias to `/assets/index.html`.

![](assets/img/sample-page-screenshot.png)

Server logs:

```text
59:779 [Info    ] Handle request
59:779 [Debug   ] Request 'GET /assets/index.html' matches route 'GET /assets/:path': apply 'assetsHandler'
59:779 [Debug   ] Successfuly served static file from '/assets/index.html'
59:788 [Info    ] Handle request
59:788 [Debug   ] Request 'GET /assets/logo.png' matches route 'GET /assets/:path': apply 'assetsHandler'
59:788 [Debug   ] Successfuly served static file from '/assets/logo.png'
```

Mime type is computed based on file extension: [/assets/hello.txt](http://localhost:8000/assets/hello.txt)

```shell
$ http :8000/assets/hello.txt
HTTP/1.1 200 OK
content-length: 6
content-type: text/plain
date: Sat, 12 Nov 2022 10:14:32 GMT
vary: Accept-Encoding

World!

$ █
```

### Hooks

Precise provides hooks to apply side effects or to change the response.

Currently supported hooks:

- onRequest: triggered as soon as the request is served
- onSend: triggered just before sending a response

[`demo/sample10.ts`](demo/sample10.ts):

```typescript
import {
  exposeVersion,
  RequestWithRouteParams,
  WebServer,
  WebServerable,
} from 'https://deno.land/x/precise/mod.ts'

const webServer = new WebServer()
webServer.setHook('onSend', exposeVersion())
webServer.setHook(
  'onRequest',
  function requestNotifier(this: WebServerable, req: RequestWithRouteParams) {
    this.logger.warn(`New incoming request: url=${req.url}`)
  },
)
webServer.register({
  path: '/',
  handler: () => ({ foo: 'bar' }),
})
await webServer.start()
```

> In this example, we use a provided 'exposeVersion' middleware as an `onSend` hook to change the
> response headers juste before sending response to the client. Feel free to use your own…
>
> By default `exposeVersion` use `name` and `version` of Precise.
>
> The `onRequest` hook is dedicated for some side effects about the request, don't use it to send a
> response (prefer a middleware, route, or request handler for that).

```shell
$ http :8000/
HTTP/1.1 200 OK
content-length: 13
content-type: application/json
date: Tue, 15 Nov 2022 17:24:35 GMT
vary: Accept-Encoding
x-powered-by: Precise/0.0.16

{
    "foo": "bar"
}

$ █
```

### Multi CPU cores

Precise provides two ways to use multiple CPU cores:

- the first is based on a web cluster component proxifying the requests to workers, an easy way to use multiple CPU cores.
- the second one is based on request workers

### Web cluster

One front web server acting as a reverse proxy towards multiple backend web servers.

[`demo/sample11.ts`](demo/sample11.ts):

```typescript
import { WebCluster, toNumber } from 'https://deno.land/x/precise/mod.ts'

const concurrency = toNumber(Deno.env.get('WORKERS'))
const workerUrl = new URL('./sample11-worker.ts', import.meta.url).href
const webCluster = new WebCluster({ workerUrl, concurrency })
await webCluster.start()
```

[`demo/sample11-worker.ts`](demo/sample11-worker.ts):

```typescript
import { WebServer, WebServerable } from 'https://deno.land/x/precise/mod.ts'

const workerName = self.name
let webServer: WebServerable
type Command = (data: MessageEvent['data']) => Promise<void>
const commands: Record<string, Command> = {
  start: async (data: { port: number }) => {
    const { port } = data
    webServer = new WebServer({ name: workerName, port })
    webServer.get('/', () => ({ foo: 'bar' }))
    await webServer.start()
  },
  stop: async () => {
    if (webServer) {
      await webServer.stop()
    }
    self.close()
  },
}

self.onmessage = async (evt) => {
  if (evt.type === 'message') {
    const command = commands[evt.data.cmd]
    if (command) {
      await command(evt.data)
    }
  }
}
```

> In this example, we use a command pattern in the worker to start and stop the web server

```shell
$ WORKERS=2 deno run demo/sample11.ts
03:239 [Info    ] [Cluster] Create web server
03:266 [Info    ] [Cluster] Start web server
03:266 [Debug   ] [Cluster] Trying to bind: port=8000 hostname=undefined
03:267 [Debug   ] [Cluster] Successfuly binded: port=8000 hostname=0.0.0.0
03:267 [Info    ] [Cluster] Register 'proxyHandler' on route 'ALL *'
03:267 [Info    ] [Cluster] Web server running. Access it at: http://localhost:8000/
03:375 [Info    ] [Cluster worker #2] Create web server
03:376 [Info    ] [Cluster worker #2] Start web server
03:376 [Debug   ] [Cluster worker #2] Trying to bind: port=8002 hostname=undefined
03:377 [Debug   ] [Cluster worker #2] Successfuly binded: port=8002 hostname=0.0.0.0
03:376 [Info    ] [Cluster worker #1] Create web server
03:377 [Info    ] [Cluster worker #1] Start web server
03:377 [Debug   ] [Cluster worker #1] Trying to bind: port=8001 hostname=undefined
03:377 [Debug   ] [Cluster worker #1] Successfuly binded: port=8001 hostname=0.0.0.0
03:384 [Info    ] [Cluster worker #1] Register 'getHandler' on route 'GET /'
03:384 [Info    ] [Cluster worker #2] Register 'getHandler' on route 'GET /'
03:384 [Info    ] [Cluster worker #1] Web server running. Access it at: http://localhost:8001/
03:384 [Info    ] [Cluster worker #2] Web server running. Access it at: http://localhost:8002/
```

> Set the concurrency (number of workers) with `WORKERS` env var, or let by default and launch as many workers as the available CPU cores.

```shell
$ http :8000/
HTTP/1.1 200 OK
content-type: application/json

{
    "foo": "bar"
}

$ █
```

Server logs:

```shell
09:374 [Debug   ] [Cluster] Request 'GET /' matches route 'ALL *': apply 'proxyHandler'
09:374 [Info    ] [Cluster] Proxify to http://localhost:8001
09:381 [Info    ] [Cluster worker #1] Handle request
09:381 [Debug   ] [Cluster worker #1] Request 'GET /' matches route 'GET /': apply 'getHandler'
```

> The cluster will forward each request to the next worker in a 1..N loop

### Request workers

A middleware wrapping a provided handler into multiple web workers:

- One single server
- Each request that might be served by your handler is delegated to a worker

[`demo/sample12.ts`](demo/sample12.ts):

```typescript
import { WebServer, requestWorker } from 'https://deno.land/x/precise/mod.ts'

const webServer = new WebServer()
const workerUrl = new URL('./sample12-worker.ts', import.meta.url).href
webServer.register(requestWorker({ concurrency: 3, workerUrl }))
await webServer.start()
```

> In this example, we use 3 workers.

[`demo/sample12-worker.ts`](demo/sample12-worker.ts):

```typescript
/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />
import {
  defaults,
  RequestMessage,
  fromRawRequest,
  toRawResponse,
} from 'https://deno.land/x/precise/mod.ts'

const logger = defaults.buildLogger({ name: self.name })

self.onmessage = async (evt) => {
  const { type } = evt
  if (type !== 'message') {
    return
  }
  const data: RequestMessage = evt.data
  if (data.type === 'request') {
    logger.info('Handling incoming request')
    const req: Request = fromRawRequest(data.request)
    const connInfo = data.connInfo
    const response = await toRawResponse(
      Response.json({
        requestHostname: (connInfo.remoteAddr as Deno.NetAddr).hostname,
        requestUrl: req.url,
      }),
    )
    self.postMessage({ type: 'response', response })
  }
}
```

> Due to the behaviour of Deno workers, the request and response have to be serialized.

## License

The [MIT License](LICENSE)
