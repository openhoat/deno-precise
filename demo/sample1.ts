import { WebServer } from '../mod.ts'

void new WebServer()
  .register({
    path: '/',
    handler: () => ({ foo: 'bar' }),
  })
  .start()
