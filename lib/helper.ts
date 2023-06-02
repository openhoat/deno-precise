export const asPromise = <T>(result: Promise<T> | T): Promise<T> =>
  isPromise(result) ? result : Promise.resolve(result)

export const fileExtension = (filename: string) =>
  lastIndex(filename.split('.'))

export const isArray = <T>(o: T | T[]): o is T[] =>
  typeof o === 'object' && !!o && 'length' in o

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

export const isNetAddr = (addr: Deno.Addr): addr is Deno.NetAddr =>
  'port' in addr

export const isPromise = <T>(result: Promise<T> | T): result is Promise<T> =>
  result && typeof result === 'object' &&
  typeof (result as Promise<void>).then === 'function'

export const lastIndex = <T>(a: T[]): T => a[a.length - 1]

export const toArray = <T>(o: T | T[]): T[] => (isArray(o) ? o : [o])

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
