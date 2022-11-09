import WebServer from '/mod.ts'

const webServer = new WebServer()
webServer.register({
  path: '/oops',
  handler: () => {
    throw new Error('oops')
  },
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
webServer.setErrorHandler((req: Request, err: Error, responseSent: boolean) => {
  if (responseSent) {
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

void webServer.start()
