import type { ErrorHandler } from '../../types/web/web-server.d.ts'

const errorHandler: ErrorHandler = (req, err, context) => {
  if (context.result) {
    return
  }
  return new Response(
    `Error encountered in request '${req.method} ${req.url}': ${err.message}.`,
    {
      status: 500,
    },
  )
}

export { errorHandler }
