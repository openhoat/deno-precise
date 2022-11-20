import type { ConnInfo } from '../../../../deps/std.ts'
import { WebServerable } from './web-server.d.ts'
import { Routerable } from './router.d.ts'

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

export interface MethodRegisterable<T extends Registerable<T>> {
  all(path: string, handler: RequestHandler): T

  delete(path: string, handler: RequestHandler): T

  get(path: string, handler: RequestHandler): T

  head(path: string, handler: RequestHandler): T

  options(path: string, handler: RequestHandler): T

  patch(path: string, handler: RequestHandler): T

  post(path: string, handler: RequestHandler): T

  purge(path: string, handler: RequestHandler): T

  put(path: string, handler: RequestHandler): T

  trace(path: string, handler: RequestHandler): T
}

export interface NamedRouteHandler {
  handler: RouteHandler
  name: string
}

export type NotFoundHandler = (
  this: WebServerable,
  req: RequestWithRouteParams,
  context: RequestHandlerContext,
) => RequestHandlerResult

export type OnSendHookHandler = (
  response: Response,
  req: RequestWithRouteParams,
  connInfo: ConnInfo,
) => RequestHandlerResult

export interface Registerable<T> {
  register(requestHandlerSpec: RequestHandlerSpec | Routerable): T
}

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

export type RouteHandler = (
  req: RequestWithRouteParams,
  context: RequestHandlerContext,
) => RequestHandlerResult
