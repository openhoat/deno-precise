import type { MethodRegisterable, Registerable } from './method-registerer.d.ts'
import type { WebServerable } from './web-server.d.ts'

export type RouterOptions = Partial<{
  prefix: string
}>

export interface Routerable extends Registerable<Routerable>, MethodRegisterable<Routerable> {
  readonly prefix: string

  registerToServer(server: WebServerable, prefix?: string): void
}
