import { fromFileUrl, resolve } from 'https://deno.land/std@0.162.0/path/mod.ts'
import { WebServer, assets } from '../mod.ts'

const assetsBaseDir = resolve(fromFileUrl(import.meta.url), '..', 'assets')
const webServer = new WebServer()
webServer.register(assets({ root: assetsBaseDir }))
await webServer.start()
