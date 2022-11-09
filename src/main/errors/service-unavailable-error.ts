import type { HttpErrorParams, StaticHttpError } from '../types/errors/http-error.d.ts'
import { staticImplements } from '../helper.ts'
import { HttpError } from './http-error.ts'

@staticImplements<StaticHttpError<ServiceUnavailableError>>()
class ServiceUnavailableError extends HttpError {
  static DEFAULT_MESSAGE = 'Service unavailable'
  static readonly STATUS_CODE = 503

  constructor(params?: HttpErrorParams) {
    super({
      message: ServiceUnavailableError.DEFAULT_MESSAGE,
      statusCode: ServiceUnavailableError.STATUS_CODE,
      ...params,
    })
  }
}

export { ServiceUnavailableError }
