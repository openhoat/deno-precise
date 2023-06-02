import type { Spy } from '../../../../deps/test/std.ts'
import type { LoggerStub } from '../../../types/utils.d.ts'
import { assertSpyCall, stub } from '../../../../deps/test/std.ts'
import { ConsoleStream, Logger } from '../../../../deps/x/optic.ts'
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  run,
} from '../../../../deps/test/x/tincan.ts'
import { _internals, buildLogger } from '../../../../lib/web/defaults/logger.ts'
import { memberReplacer, noop, stubLogger } from '../../../utils.ts'

describe('web defaults logger unit tests', () => {
  let loggerStub: LoggerStub
  beforeAll(() => {
    loggerStub = stubLogger()
  })
  afterAll(() => {
    loggerStub.restore()
  })
  describe('buildConsoleStream', () => {
    it('should return the default logger console stream', () => {
      const result = _internals.buildConsoleStream()
      expect(result).toBeTruthy()
      expect(result).toBeInstanceOf(ConsoleStream)
    })
  })
  describe('buildLogger', () => {
    let consoleLogSpy: Spy<Console, string[], void>
    let internalsRestore: () => void
    beforeAll(() => {
      consoleLogSpy = stub(console, 'log', noop)
      console.log = consoleLogSpy
      internalsRestore = memberReplacer(_internals, {
        buildConsoleStream: () => new ConsoleStream().withLogFooter(false),
      })
    })
    afterAll(() => {
      internalsRestore()
      consoleLogSpy.restore()
    })
    it('should return a default logger instance', () => {
      // When
      const logger = buildLogger()
      // Then
      expect(logger).toBeInstanceOf(Logger)
      expect(consoleLogSpy.calls).toHaveLength(1)
      expect(consoleLogSpy.calls[0].args).toHaveLength(1)
      expect(consoleLogSpy.calls[0].args).toMatch(
        / Info\s+Logging session initialized./,
      )
      assertSpyCall(consoleLogSpy, 0)
    })
  })
})

run()
