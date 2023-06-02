import { Middleware, RequestHandler } from './web-server.d.ts'

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

export interface Registerable<T> {
  register(middleware: Middleware): T
}
