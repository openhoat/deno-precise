import type { HttpErrorParams, StaticHttpError } from '../types/errors/http-error.d.ts'
import { staticImplements } from '../helper.ts'
import { HttpError } from './http-error.ts'

@staticImplements<StaticHttpError<UnauthorizedError>>()
class UnauthorizedError extends HttpError {
  static DEFAULT_MESSAGE = 'This action requires an authorization'
  static readonly STATUS_CODE = 401

  constructor(params?: HttpErrorParams) {
    super({
      message: UnauthorizedError.DEFAULT_MESSAGE,
      statusCode: UnauthorizedError.STATUS_CODE,
      ...params,
    })
  }
}

export { UnauthorizedError }
