import { StaticImplements } from './types/helper.d.ts'

export const asPromise = <T>(result: Promise<T> | T): Promise<T> =>
  isPromise(result) ? result : Promise.resolve(result)

export const fileExtension = (filename: string) => lastIndex(filename.split('.'))

export const isBodyInit = (value: unknown): value is BodyInit => {
  return (
    typeof value === 'string' ||
    value instanceof Blob ||
    value instanceof ArrayBuffer ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ReadableStream
  )
}

export const isDefinedObject = <T>(o: T | undefined): o is T => !!o && typeof o === 'object'

export const isPromise = <T>(result: Promise<T> | T): result is Promise<T> =>
  result && typeof result === 'object' && typeof (result as Promise<void>).then === 'function'

export const lastIndex = <T>(a: T[]): T => a[a.length - 1]

// Workaround for class static members interface : https://stackoverflow.com/questions/13955157/how-to-define-static-property-in-typescript-interface
export const staticImplements: StaticImplements =
  <T>() =>
  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  (__: T) => {} // NOSONAR

export const toNumber = (s: unknown): number | undefined => {
  if (typeof s === 'undefined' || (typeof s === 'object' && !s)) {
    return undefined
  }
  const value = Number(s)
  return isNaN(value) ? undefined : value
}

export const toResponse = (value?: Response | BodyInit | unknown): Response => {
  if (value instanceof Response) {
    return value
  }
  if (isBodyInit(value)) {
    return new Response(value)
  }
  return Response.json(value)
}
