import { WebServer } from '../mod.ts'

await new WebServer({
  errorHandler: (req, err, context) => {
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
