import type { BaseWebServerStartOptions } from '../types/web/base-web-server.d.ts'
import type {
  WebClusterOptions,
  WorkerMessage,
} from '../types/web/web-cluster.d.ts'
import { BaseWebServer } from './base-web-server.ts'
import { reverseProxy } from './middlewares/reverse-proxy.ts'

const noCpus = navigator.hardwareConcurrency

class WebCluster extends BaseWebServer {
  #workers: Worker[]
  #workerIndex = 0
  readonly #workerUrl: string

  constructor(options: WebClusterOptions) {
    const { concurrency = noCpus, name = 'Cluster', workerUrl } = options
    const prepareHandler = () => {
      const handler = reverseProxy({
        targetHostname: 'localhost',
        targetPort: () => {
          const workerIndex = this.#workerIndex
          this.#workerIndex = (this.#workerIndex + 1) % this.#workers.length
          return this.#getWorkerPort(workerIndex)
        },
      })
      return handler.bind(this)
    }
    super(prepareHandler, { ...options, name })
    this.#workerUrl = workerUrl
    this.#workers = Array.from(Array(concurrency)).map((_, index) => {
      const workerName = `${name} worker #${index + 1}`
      return new Worker(this.#workerUrl, { name: workerName, type: 'module' })
    })
  }

  #withWorkers(handler: (worker: Worker, index: number) => void) {
    this.#workers.forEach(handler)
  }

  #getWorkerPort(index: number) {
    return this.port ? this.port + index + 1 : 0
  }

  async start(options?: BaseWebServerStartOptions) {
    await super.start(options)
    this.#withWorkers((worker, index) => {
      const port = this.#getWorkerPort(index)
      const message: WorkerMessage = { cmd: 'start', port }
      worker.postMessage(message)
    })
  }

  async stop() {
    await super.stop()
    const message: WorkerMessage = { cmd: 'stop' }
    this.#withWorkers((worker) => {
      worker.postMessage(message)
    })
  }
}

export { WebCluster }
