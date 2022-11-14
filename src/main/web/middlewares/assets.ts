import { join } from '../../../../deps/std.ts'
import { mime } from '../../../../deps/x/mimetypes.ts'
import type { WebServerable } from '../../types/web/server.d.ts'
import type { RequestHandlerSpec, RequestWithRouteParams } from '../../types/web/utils.d.ts'
import { fileExtension } from '../../helper.ts'

type AssetsHandlerOptions = {
  root: string
  prefix?: string
}

const assets: (options: AssetsHandlerOptions) => RequestHandlerSpec = (options) => {
  const { prefix = '/assets', root } = options

  async function handler(this: WebServerable, req: RequestWithRouteParams) {
    if (typeof req.params?.path !== 'string') {
      return
    }
    const { path } = req.params
    const filepath = join(root, path)
    const mimeType = mime.getType(fileExtension(filepath))
    try {
      const content = await Deno.readFile(filepath)
      this.logger.debug(`Successfuly served static file from '${join(prefix, path)}'`)
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

  return { name: 'assetsHandler', handler, path: `${prefix}/:path` }
}

export type { AssetsHandlerOptions }
export { assets }
