import type { WebServerable } from '../../../main/types/web/web-server.d.ts'
import type { LoggerStub } from '../../types/utils.d.ts'
import { assertSpyCalls, Spy, spy } from '../../../../dev_deps/std.ts'
import { afterAll, beforeAll, describe, it, run } from '../../../../dev_deps/x/tincan.ts'
import { _internals, shutdownOnSignals } from '../../../main/web/signals.ts'
import { doNextTick, memberReplacer, stubLogger } from '../../utils.ts'

describe('web signals unit tests', () => {
  let loggerStub: LoggerStub
  let addSignalListenerSpy: Spy
  let removeSignalListenerSpy: Spy
  let internalsRestore: () => void
  beforeAll(() => {
    loggerStub = stubLogger()
    addSignalListenerSpy = spy((__, handler) => {
      void doNextTick(handler)
    })
    removeSignalListenerSpy = spy()
    internalsRestore = memberReplacer(_internals, {
      addSignalListener: addSignalListenerSpy,
      removeSignalListener: removeSignalListenerSpy,
    })
  })
  afterAll(() => {
    internalsRestore()
    loggerStub.restore()
  })
  describe('shutdownOnSignals', () => {
    it('should stop the web server given a SIGINT signal occurs', async () => {
      const stopSpy = spy(() => Promise.resolve())
      const webServer = {
        logger: loggerStub.logger,
        stop: stopSpy,
      } as unknown as WebServerable
      shutdownOnSignals(webServer)
      assertSpyCalls(addSignalListenerSpy, 3)
      await doNextTick(() => {
        assertSpyCalls(stopSpy, 3)
      })
    })
  })
})

run()
