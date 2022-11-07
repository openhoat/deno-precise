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

export type RequestHandlerResult = Response | void | Promise<Response | void>
export type RequestHandler = (req: Request, responseSent: boolean) => RequestHandlerResult

export interface RequestHandlerOptions {
  handler: RequestHandler
  method?: HttpMethod
  name?: string
  path: string
}

export interface NamedRequestHandler {
  handler: RequestHandler
  name: string
}
