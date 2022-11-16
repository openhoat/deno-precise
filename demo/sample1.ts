import { WebServer } from '../mod.ts'

await new WebServer().get('/', () => ({ foo: 'bar' })).start()
