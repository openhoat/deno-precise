import type { HttpErrorParams, StaticHttpError } from '../types/errors/http-error.d.ts'
import { staticImplements } from '../helper.ts'
import { HttpError } from './http-error.ts'

@staticImplements<StaticHttpError<NotFoundError>>()
class NotFoundError extends HttpError {
  static DEFAULT_MESSAGE = 'Resource not found'
  static readonly STATUS_CODE = 404

  constructor(params?: HttpErrorParams) {
    super({
      message: NotFoundError.DEFAULT_MESSAGE,
      statusCode: NotFoundError.STATUS_CODE,
      ...params,
    })
  }
}

export { NotFoundError }
