import type { Logger } from '../../../deps/x/optic.ts'

export type BaseWebServerOptions = Partial<{
  hostname: string
  logger: Logger
  logRequestHandling: boolean
  name: string
  port: number
}>

export type BaseWebServerStartOptions = Partial<{ syncServe: boolean }>

export interface BaseWebServerable {
  readonly hostname: string | undefined
  readonly logger: Readonly<Logger>
  readonly port: number | undefined
  readonly started: boolean

  start(options?: BaseWebServerStartOptions): Promise<void>

  stop(): Promise<void>
}
