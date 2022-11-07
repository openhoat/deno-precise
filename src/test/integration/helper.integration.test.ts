import { toNumber } from '../../main/helper.ts'
import { assertEquals, description } from '../deps.ts'
import { eachAsync } from '../utils.ts'

Deno.test('helper integration tests', async (t) => {
  const testCases = [
    { given: '123', expectedResult: 123 },
    { given: 'abcde', expectedResult: undefined },
    { given: undefined, expectedResult: undefined },
    { given: null, expectedResult: undefined },
    { given: '123.678 ', expectedResult: 123.678 },
  ]
  await eachAsync(testCases, async ({ given, expectedResult }) => {
    await t.step(
      description({
        name: 'toNumber',
        given: `${given} (type ${typeof given})`,
        should: `return ${expectedResult}`,
      }),
      () => {
        const result = toNumber(given)
        assertEquals(result, expectedResult)
      },
    )
  })
})
