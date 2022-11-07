export type AsyncIterator<T, U> = (item: T, index: number, ar: T[]) => Promise<U>

export const eachAsync = <T>(array: T[], iterator: AsyncIterator<T, void>): Promise<void> =>
  array.reduce<Promise<void>>(
    (p, item, index, ar) =>
      p.then(async () => {
        await iterator(item, index, ar)
      }),
    Promise.resolve(),
  )
