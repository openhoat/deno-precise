import type { CredentialsChecker } from '../mod.ts'
import { basicAuthChecker, WebServer } from '../mod.ts'

const checkCredentials: CredentialsChecker = (username, password) =>
  username === 'johndoe' && password === 'secret'

const webServer = new WebServer()
webServer.register({
  onRequest: basicAuthChecker(checkCredentials),
  path: '/',
  handler: () => ({ foo: 'bar' }),
})
await webServer.start()
