import { Router } from '../../mod.ts'
import { v1Router } from './v1/v1_router.ts'

const apiRouter = new Router({ prefix: '/api' })
apiRouter.register(v1Router)
apiRouter.get('/health', () => ({ ok: true }))

export { apiRouter }
