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

export interface RequestWithRouteParams extends Request {
  params?: Record<string, string>
}

export type RequestHandlerResult = Response | void | Promise<Response | void>

export type NotFoundHandler = (req: RequestWithRouteParams) => RequestHandlerResult

export type RequestHandler = (
  req: RequestWithRouteParams,
  responseSent: boolean,
) => RequestHandlerResult

export type ErrorHandler = (
  req: RequestWithRouteParams,
  err: Error,
  responseSent: boolean,
) => RequestHandlerResult

export interface RequestHandlerSpec {
  handler: RequestHandler
  method?: HttpMethod
  name?: string
  path: string
}

export interface NamedRequestHandler {
  handler: RequestHandler
  name: string
}
