import type { Stub } from '../deps/std.ts'
import type { Logger } from '../../main/deps/x/optic.ts'

export type LoggerStub = {
  logger: Logger
  restore: () => void
  stubs: Record<string, Stub>
}

export type StubLogger = () => LoggerStub
