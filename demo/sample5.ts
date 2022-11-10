import WebServer from '../mod.ts'

void new WebServer({
  errorHandler: (req: Request, err: Error, responseSent: boolean) => {
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
  },
  notFoundHandler: (req: Request) =>
    Response.json(
      {
        code: 'NOT_FOUND',
        message: `Resource '${req.method} ${req.url}' not found.`,
      },
      { status: 404 },
    ),
  handlers: [
    {
      path: '/oops',
      handler: () => {
        throw new Error('oops')
      },
    },
  ],
}).start()
