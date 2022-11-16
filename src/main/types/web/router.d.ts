import type { WebServerable } from './server.d.ts'
import type { MethodRegisterable, Registerable } from './utils.d.ts'

export type RouterOptions = Partial<{
  prefix: string
}>

export interface Routerable extends Registerable<Routerable>, MethodRegisterable<Routerable> {
  readonly prefix: string
  registerToServer(server: WebServerable, prefix?: string): void
}
