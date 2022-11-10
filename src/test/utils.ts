export type AsyncIterator<T, U> = (item: T, index: number, ar: T[]) => Promise<U>

export const description = (
  { given, should }: { given: string; should: string },
  paddingLevel = 0,
): string => {
  const newLinePadding = Array.from(Array(paddingLevel * 2))
    .fill(' ')
    .join('')
  return `given: ${given}\n${newLinePadding}should: ${should}`
}

export const eachAsync = <T>(array: T[], iterator: AsyncIterator<T, void>): Promise<void> =>
  array.reduce<Promise<void>>(
    (p, item, index, ar) =>
      p.then(async () => {
        await iterator(item, index, ar)
      }),
    Promise.resolve(),
  )
