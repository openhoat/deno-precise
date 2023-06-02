import type { WebServerable } from '../types/web/web-server.d.ts'

const shutdownOnSignals = (
  webServer: WebServerable,
  signals: Deno.Signal[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'],
) => {
  const { logger } = webServer
  const { onceSignal, terminateSignalHandler } = _internals
  signals.forEach((signal) => {
    logger.debug(`Handling signal ${signal}`)
    onceSignal(signal, terminateSignalHandler(webServer))
  })
  if (signals.length) {
    logger.info(`Type 'kill -s ${signals[0]} ${Deno.pid}' to stop`)
  }
}

const _internals = {
  addSignalListener: Deno.addSignalListener,
  removeSignalListener: Deno.removeSignalListener,
  onceSignal: (signal: Deno.Signal, handler: (signal: Deno.Signal) => void) => {
    const signalHandler = () => {
      _internals.removeSignalListener(signal, signalHandler)
      handler(signal)
    }
    _internals.addSignalListener(signal, signalHandler)
  },
  terminateSignalHandler:
    (webServer: WebServerable) => async (signal: Deno.Signal) => {
      webServer.logger.warn(`Received signal ${signal}`)
      await webServer.stop()
    },
}

export { _internals, shutdownOnSignals }
