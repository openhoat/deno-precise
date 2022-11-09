import type { HttpErrorParams, StaticHttpError } from '../types/errors/http-error.d.ts'
import { staticImplements } from '../helper.ts'
import { HttpError } from './http-error.ts'

@staticImplements<StaticHttpError<ForbiddenError>>()
class ForbiddenError extends HttpError {
  static DEFAULT_MESSAGE = 'Access to the requested resource is forbidden'
  static readonly STATUS_CODE = 403

  constructor(params?: HttpErrorParams) {
    super({
      message: ForbiddenError.DEFAULT_MESSAGE,
      statusCode: ForbiddenError.STATUS_CODE,
      ...params,
    })
  }
}

export { ForbiddenError }
