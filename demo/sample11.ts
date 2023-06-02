import { toNumber, WebCluster } from '../mod.ts'

const concurrency = toNumber(Deno.env.get('WORKERS'))
const workerUrl = new URL('./sample11-worker.ts', import.meta.url).href
const webCluster = new WebCluster({ workerUrl, concurrency })
await webCluster.start()
