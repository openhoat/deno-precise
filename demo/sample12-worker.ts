/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

import { defaults, RequestMessage, fromRawRequest, toRawResponse } from '../mod.ts'

const logger = defaults.buildLogger({ name: self.name })

self.onmessage = async (evt) => {
  const { type } = evt
  if (type !== 'message') {
    return
  }
  const data: RequestMessage = evt.data
  if (data.type === 'request') {
    logger.info('Handling incoming request')
    const req: Request = fromRawRequest(data.request)
    const connInfo = data.connInfo
    const response = await toRawResponse(
      Response.json({
        requestHostname: (connInfo.remoteAddr as Deno.NetAddr).hostname,
        requestUrl: req.url,
      }),
    )
    self.postMessage({ type: 'response', response })
  }
}
