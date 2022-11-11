import { WebServer } from '../mod.ts'
import { apiRouter } from './api/api_router.ts'

const webServer = new WebServer()
webServer.register(apiRouter)
void webServer.start()
