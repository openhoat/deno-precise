import {
  exposeVersion,
  RequestWithRouteParams,
  WebServer,
  WebServerable,
} from '../mod.ts'

const webServer = new WebServer()
webServer.setHook('onSend', exposeVersion())
webServer.setHook(
  'onRequest',
  function requestNotifier(this: WebServerable, req: RequestWithRouteParams) {
    this.logger.warn(`New incoming request: url=${req.url}`)
  },
)
webServer.register({
  path: '/',
  handler: () => ({ foo: 'bar' }),
})
await webServer.start()
