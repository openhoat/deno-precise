import { WebServer, requestWorker } from '../mod.ts'

const webServer = new WebServer()
const workerUrl = new URL('./sample13-worker.ts', import.meta.url).href
webServer.register(requestWorker({ workerUrl }))
await webServer.start()
