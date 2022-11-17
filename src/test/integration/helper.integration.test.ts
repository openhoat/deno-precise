import { asPromise, fileExtension, isBodyInit, toNumber, toResponse } from '../../main/helper.ts'
import { eachAsync } from '../utils.ts'
import { describe, expect, test } from '../../../dev_deps/x/stej.ts'

describe('helper integration tests', async () => {
  await describe('asPromise', async () => {
    await test(
      {
        given: 'a promise',
        should: 'return the given promise',
      },
      () => {
        const p = Promise.resolve('foo')
        const result = asPromise(p)
        expect(result).toBe(p)
      },
    )
    await test(
      {
        given: 'a value',
        should: 'return a Promise that will resolve to the given value',
      },
      async () => {
        const value = 'foo'
        const result = await asPromise(value)
        expect(result).toBe(value)
      },
    )
  })
  await describe('fileExtension', async () => {
    await test(
      {
        given: 'foo.txt',
        should: 'return txt',
      },
      () => {
        const filename = 'foo.txt'
        const result = fileExtension(filename)
        expect(result).toEqual('txt')
      },
    )
  })
  await describe('isBodyInit', async () => {
    await test(
      {
        given: 'a string',
        should: 'return true',
      },
      () => {
        const value = 'any content string'
        const result = isBodyInit(value)
        expect(result).toEqual(true)
      },
    )
    await test(
      {
        given: 'a blob',
        should: 'return true',
      },
      () => {
        const value = new Blob()
        const result = isBodyInit(value)
        expect(result).toEqual(true)
      },
    )
    await test(
      {
        given: 'an array buffer',
        should: 'return true',
      },
      () => {
        const value = new ArrayBuffer(0)
        const result = isBodyInit(value)
        expect(result).toEqual(true)
      },
    )
    await test(
      {
        given: "{ foo: 'bar' }",
        should: 'return false',
      },
      () => {
        const value = { foo: 'bar' }
        const result = isBodyInit(value)
        expect(result).toEqual(false)
      },
    )
  })
  await describe('toNumber', async () => {
    const testCases = [
      { given: '123', expectedResult: 123 },
      { given: 'abcde', expectedResult: undefined },
      { given: undefined, expectedResult: undefined },
      { given: null, expectedResult: undefined },
      { given: '123.678 ', expectedResult: 123.678 },
    ]
    await eachAsync(testCases, async ({ given, expectedResult }) => {
      await test(
        {
          given: `${given} (type ${typeof given})`,
          should: `return ${expectedResult}`,
        },
        () => {
          const result = toNumber(given)
          expect(result).toEqual(expectedResult)
        },
      )
    })
  })
  await describe('toResponse', async () => {
    await test(
      {
        given: 'a response',
        should: 'return the given response',
      },
      () => {
        const value = new Response('foo')
        const result = toResponse(value)
        expect(result).toEqual(value)
      },
    )
    await test(
      {
        given: 'a body',
        should: 'return the given response',
      },
      () => {
        const value = 'foo'
        const result = toResponse(value)
        expect(result).toBeInstanceOf(Response)
      },
    )
    await test(
      {
        given: 'a literal object',
        should: 'return a response',
      },
      () => {
        const value = { foo: 'bar' }
        const result = toResponse(value)
        expect(result).toBeInstanceOf(Response)
      },
    )
  })
})
