import { WebServerable } from './server.d.ts'

export type HttpMethod =
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PURGE'
  | 'PUT'
  | 'TRACE'

export type HttpMethodSpec = HttpMethod | 'ALL'

export interface RequestWithRouteParams extends Request {
  params?: Record<string, string>
}

export type RequestHandlerResult = Response | unknown | void | Promise<Response | unknown | void>

export type ErrorHandler = (
  this: WebServerable,
  req: RequestWithRouteParams,
  err: Error,
  responseSent: boolean,
) => RequestHandlerResult

export type NotFoundHandler = (
  this: WebServerable,
  req: RequestWithRouteParams,
) => RequestHandlerResult

export type RequestHandler = (
  this: WebServerable,
  req: RequestWithRouteParams,
  responseSent: boolean,
) => RequestHandlerResult

export type RouteHandler = (
  req: RequestWithRouteParams,
  responseSent: boolean,
) => RequestHandlerResult

export interface RequestHandlerSpec {
  handler: RequestHandler
  method?: HttpMethodSpec
  name?: string
  path?: string
}

export interface NamedRouteHandler {
  handler: RouteHandler
  name: string
}
