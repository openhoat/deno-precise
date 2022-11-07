import type { RequestHandler, RequestHandlerResult } from '../types/web/utils.d.ts'
import { WebServerable } from '../types/web/server.d.ts'

export enum HttpMethods {
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PURGE = 'PURGE',
  PUT = 'PUT',
  TRACE = 'TRACE',
}

export const defaultNotFoundRequestHandler: RequestHandler = (req: Request, responseSent) => {
  if (responseSent) {
    return
  }
  return new Response(`Resource ${req.url} not found.`, { status: 404 })
}

export const exitOnSignals = (
  webServer: WebServerable,
  signals: Deno.Signal[] = ['SIGINT', 'SIGTERM'],
) => {
  const onceSignal = (signal: Deno.Signal, handler: (signal: Deno.Signal) => void) => {
    const signalHandler = () => {
      Deno.removeSignalListener(signal, signalHandler)
      handler(signal)
    }
    Deno.addSignalListener(signal, signalHandler)
  }
  const terminateSignalHandler = async (signal: Deno.Signal) => {
    webServer.logger.warn(`Received signal ${signal}`)
    await webServer.stop()
  }
  signals.forEach((signal) => {
    onceSignal(signal, terminateSignalHandler)
  })
}

export const hostnameForDisplay = (hostname?: string): string => {
  // If the hostname is "0.0.0.0", we display "localhost" in console
  // because browsers in Windows don't resolve "0.0.0.0".
  // See the discussion in https://github.com/denoland/deno_std/issues/1165
  return !hostname || hostname === '0.0.0.0' ? 'localhost' : hostname
}

export const isRequestHandlerResultPromise = (
  result: RequestHandlerResult,
): result is Promise<Response | void> => {
  return typeof result !== 'undefined' && typeof (result as Promise<void>).then === 'function'
}

export const toNamedRequestHandler = (requestHandler: RequestHandler) => {
  return { handler: requestHandler, name: requestHandler.name }
}
