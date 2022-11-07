import { StaticImplements } from './types/helper.d.ts'

const isDefinedObject = <T>(o: T | undefined): o is T => !!o && typeof o === 'object'

const toNumber = (s: unknown): number | undefined => {
  if (typeof s === 'undefined' || (typeof s === 'object' && !s)) {
    return undefined
  }
  const value = Number(s)
  return isNaN(value) ? undefined : value
}

// Workaround for class static members interface : https://stackoverflow.com/questions/13955157/how-to-define-static-property-in-typescript-interface
export const staticImplements: StaticImplements =
  <T>() =>
  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  (__: T) => {} // NOSONAR

export { isDefinedObject, toNumber }
