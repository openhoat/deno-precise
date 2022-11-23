import { dirname, fromFileUrl, resolve } from './deps/std.ts'
import { assets, WebServer } from '../mod.ts'

const __dirname = dirname(fromFileUrl(import.meta.url))
const assetsBaseDir = resolve(__dirname, 'assets')
const webServer = new WebServer()
webServer.register(assets({ root: assetsBaseDir }))
await webServer.start()
