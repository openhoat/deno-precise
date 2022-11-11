import { WebServer } from '../mod.ts'

await new WebServer()
  .register({
    path: '/',
    handler: () => ({ foo: 'bar' }),
  })
  .start()
