/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

import { WebServer, WebServerable } from '../mod.ts'

const workerName = self.name
let webServer: WebServerable
type Command = (data: MessageEvent['data']) => Promise<void>
const commands: Record<string, Command> = {
  start: async (data: { port: number }) => {
    const { port } = data
    webServer = new WebServer({ name: workerName, port })
    webServer.get('/', () => ({ foo: 'bar' }))
    await webServer.start()
  },
  stop: async () => {
    if (webServer) {
      await webServer.stop()
    }
    self.close()
  },
}

self.onmessage = async (evt) => {
  if (evt.type === 'message') {
    const command = commands[evt.data.cmd]
    if (command) {
      await command(evt.data)
    }
  }
}
