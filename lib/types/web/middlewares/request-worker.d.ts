import type { ConnInfo } from '../../../../deps/std.ts'

export type RawRequest = {
  body: ArrayBuffer
  headers: HeadersInit
  method: string
  url: string
}

export type RawResponse = {
  body: ArrayBuffer
  headers: HeadersInit
  status: number
}

export type RequestMessage = {
  connInfo: ConnInfo
  request: RawRequest
  type: 'request'
}

export type ResponseMessage = {
  response: RawResponse
  type: 'response'
}
