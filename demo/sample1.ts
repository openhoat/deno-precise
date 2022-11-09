import WebServer from '/mod.ts'

void new WebServer()
  .register({
    path: '/',
    handler: () => Response.json({ foo: 'bar' }),
  })
  .start()
