import type { HttpErrorParams, StaticHttpError } from '../types/errors/http-error.d.ts'
import { staticImplements } from '../helper.ts'
import { HttpError } from './http-error.ts'

@staticImplements<StaticHttpError<InternalServerError>>()
class InternalServerError extends HttpError {
  static DEFAULT_MESSAGE = 'Internal error'
  static readonly STATUS_CODE = 500

  constructor(params?: HttpErrorParams) {
    super({
      message: InternalServerError.DEFAULT_MESSAGE,
      statusCode: InternalServerError.STATUS_CODE,
      ...params,
    })
  }
}

export { InternalServerError }
