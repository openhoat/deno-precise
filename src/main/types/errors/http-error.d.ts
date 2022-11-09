import type { CustomErrorable, CustomErrorParams } from './custom-error.d.ts'

export interface StatusCodeable {
  statusCode: number
}

export interface Bodyable {
  body: unknown
}

export type HttpErrorParams = CustomErrorParams & Partial<StatusCodeable> & Partial<Bodyable>

export type HttpErrorable = CustomErrorable & StatusCodeable

export interface StaticHttpError<T extends HttpErrorable = HttpErrorable> {
  DEFAULT_MESSAGE: string
  DEFAULT_STATUS_CODE: number
  new (params?: HttpErrorParams): T
}
