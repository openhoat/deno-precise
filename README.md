[![Deno module](https://shield.deno.dev/x/precise)](https://deno.land/x/precise)
[![Build](https://github.com/openhoat/deno-precise/actions/workflows/build.yml/badge.svg)](https://github.com/openhoat/deno-precise/actions/workflows/build.yml)
[![Codecov](https://codecov.io/openhoat/openhoat/deno-precise/branch/main/graph/badge.svg?token=VFJ63YUYY0)](https://app.codecov.io/openhoat/openhoat/deno-precise)

# Precise

A clean and easy web server powered by Deno.

## Getting started

- Create `sample1.ts`:

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
  $ deno run sample1.ts
  28:412 [Info    ] Logging session initialized. Initial logger min log level: Debug (programmatically set)
  28:413 [Info    ] Create API server
  28:413 [Info    ] Register 'fooHandler' with route GET /
  28:413 [Info    ] Start server
  ✅ Granted env access to "PORT".
  ✅ Granted net access to "0.0.0.0:3000".
  31:639 [Info    ] Apply server request handler 'fooHandler'
  31:639 [Info    ] Apply server request handler 'defaultNotFoundRequestHandler'
  31:639 [Info    ] Accept connection
  31:640 [Info    ] Waiting for new connection
  31:640 [Info    ] Web server running. Access it at: http://localhost:3000/
  ```

## License

The [MIT License](LICENSE)
