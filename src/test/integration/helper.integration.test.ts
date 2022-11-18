import { asPromise, fileExtension, isBodyInit, toNumber, toResponse } from '../../main/helper.ts'
import { describe, expect, it, run } from '../../../dev_deps/x/tincan.ts'

describe('helper integration tests', () => {
  describe('asPromise', () => {
    it('should return the given promise, given a promise', () => {
      const p = Promise.resolve('foo')
      const result = asPromise(p)
      expect(result).toBe(p)
    })
    it('should return a Promise that will resolve to the given value', async () => {
      const value = 'foo'
      const result = await asPromise(value)
      expect(result).toBe(value)
    })
  })
  describe('fileExtension', () => {
    it('should return txt, given foo.txt', () => {
      const filename = 'foo.txt'
      const result = fileExtension(filename)
      expect(result).toEqual('txt')
    })
  })
  describe('isBodyInit', () => {
    it('should return true, given a string', () => {
      const value = 'any content string'
      const result = isBodyInit(value)
      expect(result).toEqual(true)
    })
    it('should return true, given a blob', () => {
      const value = new Blob()
      const result = isBodyInit(value)
      expect(result).toEqual(true)
    })
    it('should return true, given an array buffer', () => {
      const value = new ArrayBuffer(0)
      const result = isBodyInit(value)
      expect(result).toEqual(true)
    })
    it("should return false, given { foo: 'bar' }", () => {
      const value = { foo: 'bar' }
      const result = isBodyInit(value)
      expect(result).toEqual(false)
    })
  })
  describe('toNumber', () => {
    const testCases = [
      { given: '123', expectedResult: 123 },
      { given: 'abcde', expectedResult: undefined },
      { given: undefined, expectedResult: undefined },
      { given: null, expectedResult: undefined },
      { given: '123.678 ', expectedResult: 123.678 },
    ]
    testCases.forEach(({ given, expectedResult }) => {
      it(`should return ${expectedResult}, given ${given} (type ${typeof given})`, () => {
        const result = toNumber(given)
        expect(result).toEqual(expectedResult)
      })
    })
  })
  describe('toResponse', () => {
    it('should return the given response, given a response', () => {
      const value = new Response('foo')
      const result = toResponse(value)
      expect(result).toEqual(value)
    })
    it('should return the given response, given a body', () => {
      const value = 'foo'
      const result = toResponse(value)
      expect(result).toBeInstanceOf(Response)
    })
    it('should return a response, given a literal object', () => {
      const value = { foo: 'bar' }
      const result = toResponse(value)
      expect(result).toBeInstanceOf(Response)
    })
  })
})

run()
