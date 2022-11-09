import type { HttpErrorParams, StaticHttpError } from '../types/errors/http-error.d.ts'
import { staticImplements } from '../helper.ts'
import { HttpError } from './http-error.ts'

@staticImplements<StaticHttpError<ConflictError>>()
class ConflictError extends HttpError {
  static DEFAULT_MESSAGE =
    'The request could not be completed due to a conflict with the current state of the target resource'
  static readonly STATUS_CODE = 409

  constructor(params?: HttpErrorParams) {
    super({
      message: ConflictError.DEFAULT_MESSAGE,
      statusCode: ConflictError.STATUS_CODE,
      ...params,
    })
  }
}

export { ConflictError }
