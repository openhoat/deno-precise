import type { ConnInfo } from '../../deps/std.ts'
import type { BaseWebServerable, BaseWebServerOptions } from './base-web-server.d.ts'
import type { HttpMethodSpec } from './http-method.d.ts'
import type { Registerable } from './method-registerer.d.ts'
import type { Routerable } from './router.d.ts'

export type ErrorHandler = (
  this: WebServerable,
  req: RequestWithRouteParams,
  err: Error,
  context: RequestHandlerContext,
) => RequestHandlerResult

export interface MethodRegisterable<T> {
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

export type Middleware = RequestHandlerSpec | Routerable

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

export type WebServerOptions = BaseWebServerOptions &
  Partial<{
    errorHandler: ErrorHandler
    handlers: Middleware[] | Middleware | RequestHandler
    notFoundHandler: NotFoundHandler
    logRequestHandling: boolean
  }>

export interface WebServerable
  extends BaseWebServerable,
    Registerable<WebServerable>,
    MethodRegisterable<WebServerable> {
  setErrorHandler(errorHandler: ErrorHandler): void

  setNotFoundHandler(notFoundHandler: NotFoundHandler): void

  setOnSendHook(hookHandler: OnSendHookHandler): void
}
