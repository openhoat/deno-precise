import { join } from '../../../deps/std.ts'
import { mime } from '../../../deps/x/mimetypes.ts'
import type {
  Middleware,
  RequestWithRouteParams,
  WebServerable,
} from '../../types/web/web-server.d.ts'
import { fileExtension } from '../../helper.ts'
import { Router } from '../router.ts'

type AssetsHandlerOptions = {
  root: string
  prefix?: string
  index?: boolean
}

const assets: (options: AssetsHandlerOptions) => Middleware = (options) => {
  const { index, prefix = '/assets', root } = options
  const handler = _internals.buildHandler(root, prefix)
  if (index === false) {
    return { name: 'assetsHandler', handler, path: `${prefix}/:path` }
  }
  const assetsRouter = new Router({ prefix })
  assetsRouter.register({ name: 'assetsIndexHandler', path: '/', handler })
  assetsRouter.register({ name: 'assetsHandler', path: '/:path', handler })
  return assetsRouter
}

const buildHandler = (root: AssetsHandlerOptions['root'], prefix: string) =>
  async function (this: WebServerable, req: RequestWithRouteParams) {
    const path = (typeof req.params?.path === 'string' && req.params?.path) ||
      '/index.html'
    const filepath = join(root, path)
    const mimeType = mime.getType(fileExtension(filepath))
    try {
      const content = await Deno.readFile(filepath)
      this.logger.debug(
        `Successfuly served static file from '${join(prefix, path)}'`,
      )
      return new Response(content, {
        headers: { ...(mimeType ? { 'Content-Type': mimeType } : {}) },
      })
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        return
      }
      throw err
    }
  }

const _internals = {
  buildHandler,
}

export type { AssetsHandlerOptions }
export { _internals, assets }
