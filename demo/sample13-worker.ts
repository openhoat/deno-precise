/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

import { defaults, RequestMessage, toRawResponse } from '../mod.ts'

const logger = defaults.buildLogger({ name: self.name })

self.onmessage = async (evt) => {
  const { type } = evt
  if (type !== 'message') {
    return
  }
  const data: RequestMessage = evt.data
  if (data.type === 'request') {
    logger.info('Handling incoming request')
    const response = await toRawResponse(Response.json({ foo: 'bar' }))
    self.postMessage({ type: 'response', response })
  }
}
