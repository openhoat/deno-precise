[![deno module](https://shield.deno.dev/x/precise)](https://deno.land/x/precise)
[![build](https://github.com/openhoat/deno-precise/actions/workflows/build.yml/badge.svg)](https://github.com/openhoat/deno-precise/actions/workflows/build.yml)
[![codecov](https://codecov.io/openhoat/openhoat/deno-precise/branch/main/graph/badge.svg?token=VFJ63YUYY0)](https://app.codecov.io/openhoat/openhoat/deno-precise)
[![vr scripts](https://badges.velociraptor.run/flat.svg)](https://velociraptor.run)

# Precise

A clean and easy web server powered by Deno.

## Getting started

### Minimal example

- Create `demo/sample1.ts`:

  ```ts
  import WebServer from 'https://deno.land/x/precise/mod.ts'

  void new WebServer()
    .register({
      path: '/',
      handler: function fooHandler() {
        return Response.json({ foo: 'bar' })
      },
    })
    .start()
  ```

- Run the server:

  ```shell
  $ deno run demo/sample1.ts
  35:511 [Info    ] Logging session initialized. Initial logger min log level: Debug (programmatically set)
  35:511 [Info    ] Create API server
  35:511 [Info    ] Register 'handler' with route GET /
  35:512 [Info    ] Start server
  ✅ Granted env access to "PORT".
  ✅ Granted net access to "0.0.0.0:8000".
  37:869 [Info    ] Apply server request handler 'handler'
  37:869 [Info    ] Apply server request handler 'defaultNotFoundRequestHandler'
  37:869 [Info    ] Accept connection
  37:869 [Info    ] Waiting for new connection
  37:869 [Info    ] Web server running. Access it at: http://localhost:8000/
  $ █
  ```

- Request:

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

# Why

This project has been created because of the lack of a stop method in Http Deno and the others third party modules.

I wanted a simple web server service, that starts, registers, and stops, and don't want to deal with 2 imbricated async iterator loops ([serving-http](https://deno.land/manual@v1.26.2/runtime/http_server_apis_low_level#serving-http)).

# Features

- [x] Basic service lifecycle
- [x] Route matching
- [x] Route params

### Logger & signals handling

- Create `demo/sample2.ts`:

  ```ts
  import WebServer, { exitOnSignals } from 'https://deno.land/x/precise/mod.ts'

  const webServer = new WebServer()
  webServer.register({
    path: '/',
    handler: () => Response.json({ foo: 'bar' }),
  })
  await webServer.start()
  exitOnSignals(webServer)
  ```

- Run the server:

  ```shell
  $ deno run demo/sample2.ts
  55:933 [Info    ] Logging session initialized. Initial logger min log level: Debug (programmatically set)
  55:933 [Info    ] Create API server
  55:933 [Info    ] Register 'handler' with route GET /
  55:934 [Info    ] Start server
  ✅ Granted env access to "PORT".
  ✅ Granted net access to "0.0.0.0:8000".
  58:410 [Info    ] Apply server request handler 'handler'
  58:410 [Info    ] Apply server request handler 'defaultNotFoundRequestHandler'
  58:410 [Info    ] Accept connection
  58:410 [Info    ] Waiting for new connection
  58:410 [Info    ] Web server running. Access it at: http://localhost:8000/
  58:410 [Debug   ] Handling signal SIGINT
  58:410 [Debug   ] Handling signal SIGTERM
  58:411 [Debug   ] Handling signal SIGQUIT
  58:411 [Info    ] Type 'kill -s SIGINT 35054' to stop
  $ █
  ```

- Stop the server:

  ```shell
  $ kill -s SIGINT 35054
  $ █
  ```

  Server logs:

  ```shell
  57:475 [Warn    ] Received signal SIGINT
  57:475 [Info    ] Stop server
  57:476 [Warn    ] Listener has been closed
  57:476 [Info    ] End processing connection
  57:476 [Info    ] Logging session complete.  Duration: 61543ms
  $ █
  ```

  > The server is properly stopped without the need to Deno.exit(),
  > so that it can be used cleanly into end-to-end tests.

### Route params

Handle routes parameters:

- Create `demo/sample3.ts`:

  ```typescript
  import WebServer, { exitOnSignals } from 'https://deno.land/x/precise/mod.ts'

  const webServer = new WebServer()
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
      return Response.json({ foo: 'bar' })
    },
  })

  try {
    await webServer.start()
  } catch (err) {
    logger.error(err)
    Deno.exit(1)
  }

  exitOnSignals(webServer)
  ```

- Request:

  ```shell
  $ http post :8000/execute/stop
  HTTP/1.1 202 Accepted
  content-length: 0
  date: Wed, 09 Nov 2022 08:37:53 GMT
  vary: Accept-Encoding

  $ █
  ```

  Server logs:

  ```shell
  09 09:37:53:001 [Info    ] Handle connection
  09 09:37:53:001 [Info    ] Waiting for new request in connection#8
  09 09:37:53:002 [Info    ] Waiting for new connection
  09 09:37:53:002 [Info    ] Handle request
  09 09:37:53:003 [Debug   ] Request pathname '/execute/stop' matches '/execute/:cmd': apply request handler 'handler'
  09 09:37:53:003 [Info    ] Waiting for new request in connection#8
  09 09:37:53:006 [Debug   ] No more request pending for connection#8
  09 09:37:53:006 [Info    ] End processing request in connection#8
  09 09:37:54:005 [Info    ] Stop server
  09 09:37:54:005 [Warn    ] Listener has been closed
  09 09:37:54:005 [Info    ] End processing connection
  09 09:37:54:006 [Info    ] Logging session complete.  Duration: 5337ms
  $ █
  ```

## License

The [MIT License](LICENSE)
