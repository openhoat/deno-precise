import { assertEquals } from '../../../dev_deps.ts'
import { toNumber } from '../../main/helper.ts'
import { description, eachAsync } from '../utils.ts'

Deno.test('helper integration tests', async (t) => {
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
