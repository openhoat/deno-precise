import { Router } from '../../../mod.ts'

const v1Router = new Router({ prefix: '/v1' })
v1Router.get('/foo', () => {
  return { foo: 'bar' }
})
v1Router.delete('/hello', () => {
  return { message: 'bye!' }
})

export { v1Router }
