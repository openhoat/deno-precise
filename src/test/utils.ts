import type { StubLogger } from './types/utils.d.ts'
import type { Stub } from '../../dev_deps/std.ts'
import { setImmediate, stub } from '../../dev_deps/std.ts'
import { ConsoleStream, Logger } from '../../deps/x/optic.ts'

export type AsyncIterator<T, U> = (item: T, index: number, ar: T[]) => Promise<U>

export const doNextTick = async (fn: () => void): Promise<void> => {
  await new Promise((resolve) => {
    setImmediate(() => {
      fn()
      resolve(undefined)
    })
  })
}

export const eachAsync = <T>(array: T[], iterator: AsyncIterator<T, void>): Promise<void> =>
  array.reduce<Promise<void>>(
    (p, item, index, ar) =>
      p.then(async () => {
        await iterator(item, index, ar)
      }),
    Promise.resolve(),
  )

export const noop = () => {
  // Intentionally returns nothing
}

export const stubLogger: StubLogger = () => {
  const logger = new Logger('test').addStream(
    new ConsoleStream().withLogHeader(false).withLogFooter(false),
  )
  const methods: ['debug', 'info', 'warn'] = ['debug', 'info', 'warn']
  const stubs: Record<string, Stub> = methods.reduce((acc, name) => {
    return { ...acc, [name]: stub(logger, name, noop) }
  }, {})
  const restore = () => {
    methods.forEach((name) => {
      stubs[name].restore()
    })
  }
  return { logger, restore, stubs }
}

export const memberReplacer = (o: Record<string, unknown>, values: Record<string, unknown>) => {
  const save = Object.keys(values).reduce<Record<string, unknown>>((acc, key) => {
    Object.assign(acc, { [key]: o[key] })
    o[key] = values[key]
    return acc
  }, {})
  return () => {
    Object.keys(save).forEach((key) => {
      o[key] = save[key]
    })
  }
}
