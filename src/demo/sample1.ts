import WebServer from 'https://deno.land/x/precise/mod.ts'

void new WebServer()
  .register({
    path: '/',
    handler: function fooHandler() {
      return Response.json({ foo: 'bar' })
    },
  })
  .start()
