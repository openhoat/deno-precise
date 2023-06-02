import type { ConnInfo } from '../../../deps/std.ts'
import type {
  BaseWebServerable,
  BaseWebServerOptions,
} from './base-web-server.d.ts'
import type { HttpMethodSpec } from './http-method.d.ts'
import type { MethodRegisterable, Registerable } from './method-registerer.d.ts'
import type { Routerable } from './router.d.ts'

export type ErrorHandler = (
  this: WebServerable,
  req: RequestWithRouteParams,
  err: Error,
  context: RequestHandlerContext,
) => RequestHandlerResult

export type Middleware = RequestHandlerSpec | Routerable

export interface NamedRouteHandler {
  handler: RouteHandler
  name: string
}

export type NotFoundHandler = RequestHandler

export type OnSendHookHandler = (
  this: WebServerable,
  req: RequestWithRouteParams,
  res: Response,
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
  onRequest?: RequestHandler
  path?: string
}

export interface RequestWithRouteParams extends Request {
  params?: Record<string, string | undefined>
}

export type ResolvedRequestHandlerResult = Response | BodyInit | unknown | void

export type RouteHandler = (
  req: RequestWithRouteParams,
  context: RequestHandlerContext,
) => RequestHandlerResult

export type WebServerOptions =
  & BaseWebServerOptions
  & Partial<{
    errorHandler: ErrorHandler
    handlers: Middleware[] | Middleware | RequestHandler
    notFoundHandler: NotFoundHandler
    logRequestHandling: boolean
  }>

export interface WebServerable
  extends
    BaseWebServerable,
    Registerable<WebServerable>,
    MethodRegisterable<WebServerable> {
  setErrorHandler(errorHandler: ErrorHandler): void

  setNotFoundHandler(notFoundHandler: NotFoundHandler): void

  setHook<T extends keyof WebServerHooks>(
    name: T,
    hookHandler: Required<WebServerHooks>[T],
  ): boolean
}

export interface WebServerHooks {
  onRequest?: RequestHandler
  onSend?: OnSendHookHandler
}
