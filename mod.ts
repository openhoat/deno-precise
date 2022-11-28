import version from './version.json' assert { type: 'json' }

export { version }
export * from './src/main/types/helper.d.ts'
export * from './src/main/types/web/defaults.d.ts'
export * from './src/main/types/web/http-method.d.ts'
export * from './src/main/types/web/router.d.ts'
export * from './src/main/types/web/web-server.d.ts'

export * from './src/main/helper.ts'
export * from './src/main/web/base-web-server.ts'
export { defaults } from './src/main/web/defaults.ts'
export * from './src/main/web/http-method.ts'
export * from './src/main/web/router.ts'
export { shutdownOnSignals } from './src/main/web/signals.ts'
export * from './src/main/web/web-cluster.ts'
export * from './src/main/web/web-server.ts'
export { assets } from './src/main/web/middlewares/assets.ts'
export * from './src/main/web/middlewares/expose-version.ts'
