import type {
  HttpErrorable,
  HttpErrorParams,
  StaticHttpError,
} from '../types/errors/http-error.d.ts'
import { staticImplements } from '../helper.ts'
import { CustomError } from './custom-error.ts'

@staticImplements<StaticHttpError>()
class HttpError extends CustomError implements HttpErrorable {
  static DEFAULT_MESSAGE = 'Http error'
  static readonly DEFAULT_STATUS_CODE = 500

  protected _statusCode: number

  constructor(params?: HttpErrorParams) {
    const message = params?.message || HttpError.DEFAULT_MESSAGE
    super({ ...params, message })
    this._statusCode = params?.statusCode || HttpError.DEFAULT_STATUS_CODE
  }

  get statusCode(): number {
    return this._statusCode
  }
}

export { HttpError }
