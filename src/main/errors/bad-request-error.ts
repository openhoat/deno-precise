import type { HttpErrorParams, StaticHttpError } from '../types/errors/http-error.d.ts'
import { staticImplements } from '../helper.ts'
import { HttpError } from './http-error.ts'

@staticImplements<StaticHttpError<BadRequestError>>()
class BadRequestError extends HttpError {
  static DEFAULT_MESSAGE = 'The server could not process due to a malformed request'
  static readonly STATUS_CODE = 400

  constructor(params?: HttpErrorParams) {
    super({
      message: BadRequestError.DEFAULT_MESSAGE,
      statusCode: BadRequestError.STATUS_CODE,
      ...params,
    })
  }
}

export { BadRequestError }
