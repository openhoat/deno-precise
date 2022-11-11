import type { RequestHandler, RequestHandlerSpec } from './utils.d.ts'
import type { WebServerable } from './server.d.ts'

export type RouterOptions = Partial<{
  prefix: string
}>

export interface Routerable {
  readonly prefix: string

  all(path: string, handler: RequestHandler): Routerable

  delete(path: string, handler: RequestHandler): Routerable

  get(path: string, handler: RequestHandler): Routerable

  head(path: string, handler: RequestHandler): Routerable

  options(path: string, handler: RequestHandler): Routerable

  patch(path: string, handler: RequestHandler): Routerable

  post(path: string, handler: RequestHandler): Routerable

  purge(path: string, handler: RequestHandler): Routerable

  put(path: string, handler: RequestHandler): Routerable

  trace(path: string, handler: RequestHandler): Routerable

  register(requestHandlerSpec: RequestHandlerSpec): Routerable

  registerToServer(server: WebServerable, prefix?: string): void
}
