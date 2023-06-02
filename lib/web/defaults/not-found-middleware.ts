import type { NotFoundHandler } from '../../types/web/web-server.d.ts'
import { Accepts } from '../../../deps/x/accepts.ts'
import { notFoundHtmlTemplateContent } from './not-found-html-template-content.ts'

const notFoundHandler: NotFoundHandler = (req: Request) => {
  const accept = new Accepts(req.headers)
  const types = accept.types(['html', 'json', 'text'])
  switch (types) {
    case 'json':
      return Response.json(
        { error: `Resource '${req.method} ${req.url}' not found.` },
        { status: 404 },
      )
    case 'text':
      return new Response(`Resource '${req.method} ${req.url}' not found.`, {
        status: 404,
      })
    case 'html':
    default: {
      type AvailableKey = 'method' | 'url'
      const keys: AvailableKey[] = ['method', 'url']
      const html = keys.reduce(
        (content, key) =>
          content.replace(new RegExp(`{{\s*${key}\s*}}`), req[key]),
        notFoundHtmlTemplateContent,
      )
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
        status: 404,
      })
    }
  }
}

export { notFoundHandler }
