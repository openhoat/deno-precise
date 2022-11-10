import type { WebServerable } from '../types/web/server.d.ts'

const exitOnSignals = (
  webServer: WebServerable,
  signals: Deno.Signal[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'],
) => {
  const { logger } = webServer
  const onceSignal = (signal: Deno.Signal, handler: (signal: Deno.Signal) => void) => {
    const signalHandler = () => {
      Deno.removeSignalListener(signal, signalHandler)
      handler(signal)
    }
    Deno.addSignalListener(signal, signalHandler)
  }
  const terminateSignalHandler = async (signal: Deno.Signal) => {
    logger.warn(`Received signal ${signal}`)
    await webServer.stop()
  }
  signals.forEach((signal) => {
    logger.debug(`Handling signal ${signal}`)
    onceSignal(signal, terminateSignalHandler)
  })
  if (signals.length) {
    logger.info(`Type 'kill -s ${signals[0]} ${Deno.pid}' to stop`)
  }
}

export { exitOnSignals }
