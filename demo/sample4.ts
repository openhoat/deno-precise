import { WebServer } from '../mod.ts'

const webServer = new WebServer()
webServer.setErrorHandler((req, err, context) => {
  if (context.result) {
    return
  }
  return Response.json(
    {
      code: 'INTERNAL_SERVER',
      message:
        `Error encountered in request '${req.method} ${req.url}': ${err.message}.`,
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
  )
)
webServer.register({
  path: '/oops',
  handler: () => {
    throw new Error('oops')
  },
})

await webServer.start()
