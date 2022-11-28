import { Middleware } from './web-server.d.ts'

export interface Registerable<T> {
  register(middleware: Middleware): T
}
