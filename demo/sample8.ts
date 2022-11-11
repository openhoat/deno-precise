import { WebServer } from '../mod.ts'
import logger from './logger.ts'

const webServer = new WebServer({ logger })
void webServer.start()
