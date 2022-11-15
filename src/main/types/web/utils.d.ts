import type { ConnInfo } from '../../../../deps/std.ts'
import { WebServerable } from './server.d.ts'

export type ErrorHandler = (
  this: WebServerable,
  req: RequestWithRouteParams,
  err: Error,
  context: RequestHandlerContext,
) => RequestHandlerResult

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

export interface NamedRouteHandler {
  handler: RouteHandler
  name: string
}

export type NotFoundHandler = (
  this: WebServerable,
  req: RequestWithRouteParams,
  context: RequestHandlerContext,
) => RequestHandlerResult

export type RequestHandler = (
  this: WebServerable,
  req: RequestWithRouteParams,
  context: RequestHandlerContext,
) => RequestHandlerResult

export type RequestHandlerContext = {
  connInfo: ConnInfo
  result?: RequestHandlerResult
}

export type RequestHandlerResult =
  | ResolvedRequestHandlerResult
  | Promise<ResolvedRequestHandlerResult>

export interface RequestHandlerSpec {
  handler: RequestHandler
  method?: HttpMethodSpec
  name?: string
  path?: string
}

export interface RequestWithRouteParams extends Request {
  params?: Record<string, string>
}

export type ResolvedRequestHandlerResult = Response | BodyInit | unknown | void

export type ResponseHook = (
  response: Response,
  req: RequestWithRouteParams,
  connInfo: ConnInfo,
) => RequestHandlerResult

export type RouteHandler = (
  req: RequestWithRouteParams,
  context: RequestHandlerContext,
) => RequestHandlerResult
