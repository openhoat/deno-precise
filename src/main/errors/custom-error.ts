import type {
  CustomErrorable,
  CustomErrorParams,
  StaticCustomError,
} from '../types/errors/custom-error.d.ts'
import { staticImplements } from '../helper.ts'

@staticImplements<StaticCustomError>()
class CustomError extends Error implements CustomErrorable {
  protected readonly _body?: unknown
  protected readonly _extra?: unknown
  protected readonly _origin?: Error

  constructor(params?: CustomErrorParams) {
    super(params?.message)
    this._body = params?.body
    this._extra = params?.extra
    this._origin = params?.origin
    /**
     * bug workaround to implement inheritance of Error class :
     * - https://goo.gl/oPf5gH
     * - https://stackoverflow.com/questions/41102060/typescript-extending-error-class
     */
    const actualProto = new.target.prototype
    Object.setPrototypeOf(this, actualProto)
  }

  get body(): unknown {
    return this._body
  }

  get extra(): unknown | undefined {
    return this._extra
  }

  get origin(): Error | undefined {
    return this._origin
  }
}

export { CustomError }
