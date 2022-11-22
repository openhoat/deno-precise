import type { Stub } from '../../../dev_deps/std.ts'
import type { Logger } from '../../../deps/x/optic.ts'

export type LoggerStub = {
  logger: Logger
  restore: () => void
  stubs: Record<string, Stub>
}

export type StubLogger = () => LoggerStub
