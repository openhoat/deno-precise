import { assert, assertEquals } from '../../../dev_deps.ts'
import { asPromise, isBodyInit, toNumber } from '../../main/helper.ts'
import { description, eachAsync } from '../utils.ts'

Deno.test('helper integration tests', async (t) => {
  await t.step('asPromise', async (t) => {
    await t.step(
      description(
        {
          given: 'a promise',
          should: 'return the given promise',
        },
        2,
      ),
      () => {
        const p = Promise.resolve('foo')
        const result = asPromise(p)
        assertEquals(result, p)
      },
    )
    await t.step(
      description(
        {
          given: 'a value',
          should: 'return a Promise that will resolve to the given value',
        },
        2,
      ),
      async () => {
        const value = 'foo'
        const result = asPromise(value)
        assertEquals(await result, value)
      },
    )
  })
  await t.step('isBodyInit', async (t) => {
    await t.step(
      description(
        {
          given: 'a string',
          should: 'return true',
        },
        2,
      ),
      () => {
        const value = 'any content string'
        const result = isBodyInit(value)
        assert(result === true)
      },
    )
    await t.step(
      description(
        {
          given: 'a blob',
          should: 'return true',
        },
        2,
      ),
      () => {
        const value = new Blob()
        const result = isBodyInit(value)
        assert(result === true)
      },
    )
  })
  await t.step('toNumber', async (t) => {
    const testCases = [
      { given: '123', expectedResult: 123 },
      { given: 'abcde', expectedResult: undefined },
      { given: undefined, expectedResult: undefined },
      { given: null, expectedResult: undefined },
      { given: '123.678 ', expectedResult: 123.678 },
    ]
    await eachAsync(testCases, async ({ given, expectedResult }) => {
      await t.step(
        description(
          {
            given: `${given} (type ${typeof given})`,
            should: `return ${expectedResult}`,
          },
          2,
        ),
        () => {
          const result = toNumber(given)
          assertEquals(result, expectedResult)
        },
      )
    })
  })
})
