import defaults from './lib/web/defaults/index.ts'
import version from './version.json' assert { type: 'json' }

export { defaults }
export { version }
export * from './lib/types/web/defaults/defaults.d.ts'
export * from './lib/types/web/http-method.d.ts'
export * from './lib/types/web/method-registerer.d.ts'
export * from './lib/types/web/middlewares/request-worker.d.ts'
export * from './lib/types/web/router.d.ts'
export * from './lib/types/web/web-server.d.ts'

export * from './lib/helper.ts'
export * from './lib/web/base-web-server.ts'
export * from './lib/web/http-method.ts'
export * from './lib/web/method-registerer.ts'
export { assets } from './lib/web/middlewares/assets.ts'
export * from './lib/web/middlewares/request-worker.ts'
export * from './lib/web/router.ts'
export { shutdownOnSignals } from './lib/web/signals.ts'
export * from './lib/web/web-cluster.ts'
export * from './lib/web/web-server.ts'
export * from './lib/web/middlewares/basic-auth.ts'
export * from './lib/web/middlewares/expose-version.ts'
