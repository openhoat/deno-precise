import defaults from './src/main/web/defaults/index.ts'
import version from './version.json' assert { type: 'json' }

export { defaults }
export { version }
export * from './src/main/types/web/defaults/defaults.d.ts'
export * from './src/main/types/web/http-method.d.ts'
export * from './src/main/types/web/method-registerer.d.ts'
export * from './src/main/types/web/middlewares/request-worker.d.ts'
export * from './src/main/types/web/router.d.ts'
export * from './src/main/types/web/web-server.d.ts'

export * from './src/main/helper.ts'
export * from './src/main/web/base-web-server.ts'
export * from './src/main/web/http-method.ts'
export * from './src/main/web/method-registerer.ts'
export { assets } from './src/main/web/middlewares/assets.ts'
export * from './src/main/web/middlewares/request-worker.ts'
export * from './src/main/web/router.ts'
export { shutdownOnSignals } from './src/main/web/signals.ts'
export * from './src/main/web/web-cluster.ts'
export * from './src/main/web/web-server.ts'
export * from './src/main/web/middlewares/expose-version.ts'
