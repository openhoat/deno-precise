import type { MethodRegisterable, Registerable, WebServerable } from './web-server.d.ts'

export type RouterOptions = Partial<{
  prefix: string
}>

export interface Routerable extends Registerable<Routerable>, MethodRegisterable<Routerable> {
  readonly prefix: string
  registerToServer(server: WebServerable, prefix?: string): void
}
