import type { WebServerOptions } from './web-server.d.ts'

export type WebClusterOptions = WebServerOptions & {
  concurrency?: number
  workerUrl: string
}

export type WorkerMessage = Record<string, unknown> & {
  cmd: 'start' | 'stop'
}
