import type { ConnInfo } from '../../../deps/std.ts'
import type { BaseWebServerable } from '../../types/web/base-web-server.d.ts'
import type {
  RequestHandlerContext,
  RequestWithRouteParams,
} from '../../types/web/web-server.d.ts'

type ReverseProxyHandlerOptions = {
  targetHostname: string | ((req: Request) => string)
  targetPort: number | ((req: Request) => number)
}

const reverseProxy: (
  options: ReverseProxyHandlerOptions,
) => (
  this: BaseWebServerable,
  req: RequestWithRouteParams,
  context: RequestHandlerContext | ConnInfo,
) => Promise<Response> = (options) =>
  function proxyHandler(
    this: BaseWebServerable,
    req: Request,
    context: RequestHandlerContext | ConnInfo,
  ) {
    const hostname = typeof options.targetHostname === 'function'
      ? options.targetHostname(req)
      : options.targetHostname
    const port = typeof options.targetPort === 'function'
      ? options.targetPort(req)
      : options.targetPort
    const url = `http://${hostname}:${port}`
    const connInfo = 'connInfo' in context ? context.connInfo : context
    const forwardedFor = [
      (connInfo.remoteAddr as Deno.NetAddr).hostname,
      ...(req.headers.get('x-forwarded-for') || '').split(','),
    ]
      .filter((item) => !!item)
      .join(',')
    this.logger.info(`Proxify to ${url}`)
    return fetch(url, {
      method: req.method,
      headers: { ...req.headers, 'x-forwarded-for': forwardedFor },
      body: req.body,
    })
  }

export type { ReverseProxyHandlerOptions }
export { reverseProxy }
