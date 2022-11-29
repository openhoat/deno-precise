import { WebServer, requestWorker } from '../mod.ts'

const webServer = new WebServer()
const workerUrl = new URL('./sample12-worker.ts', import.meta.url).href
webServer.register(requestWorker({ concurrency: 10, workerUrl }))
await webServer.start()
