import type {
  RawRequest,
  RawResponse,
  ResponseMessage,
} from '../../types/web/middlewares/request-worker.d.ts'
import { RequestMessage } from '../../types/web/middlewares/request-worker.d.ts'
import type { RequestHandlerSpec } from '../../types/web/web-server.d.ts'
import { RequestHandler } from '../../types/web/web-server.d.ts'

const toRawHeaders = (headers: Headers): HeadersInit =>
  Array.from(headers.entries()).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
const toRawRequest = async (req: Request): Promise<RawRequest> => {
  const { method, headers, url } = req
  const body = req.body && (await req.json())
  return { body, headers: toRawHeaders(headers), method, url }
}

const fromRawRequest = (jsonRequest: RawRequest) => {
  const body = jsonRequest.body && JSON.stringify(jsonRequest.body)
  return new Request(jsonRequest.url, { ...jsonRequest, body })
}

const toRawResponse = async (res: Response): Promise<RawResponse> => {
  const { headers, status } = res
  const body = await res.arrayBuffer()
  return { body, headers: toRawHeaders(headers), status }
}

const fromRawResponse = (jsonRes: RawResponse) => new Response(jsonRes.body, jsonRes)

const noCpus = navigator.hardwareConcurrency

const requestWorker: (options: {
  concurrency?: number
  workerUrl: string
}) => RequestHandlerSpec = (options) => {
  const { concurrency = noCpus, workerUrl } = options
  const workers = Array.from(Array(concurrency)).map(
    (_, index) => new Worker(workerUrl, { name: `request worker #${index + 1}`, type: 'module' }),
  )
  let workerIndex = 0
  const handler: RequestHandler = async (req, context) => {
    const worker = workers[workerIndex]
    workerIndex = (workerIndex + 1) % workers.length
    const request = await toRawRequest(req)
    return new Promise<Response>((resolve) => {
      worker.onmessage = async (evt) => {
        const { type } = evt
        if (type !== 'message') {
          return
        }
        const data: ResponseMessage = evt.data
        if (data.type === 'response') {
          const jsonResponse: RawResponse = data.response
          const response = await fromRawResponse(jsonResponse)
          resolve(response)
        }
      }
      const message: RequestMessage = {
        connInfo: context.connInfo,
        request,
        type: 'request',
      }
      worker.postMessage(message)
    })
  }
  return { handler }
}

export { fromRawRequest, fromRawResponse, requestWorker, toRawHeaders, toRawRequest, toRawResponse }
