import { ResponseHook } from '../../types/web/utils.d.ts'
import version from '../../version.ts'

const exposeVersion: ResponseHook = (response) => {
  response.headers.set('X-Powered-By', `Precise/${version}`)
}

export { exposeVersion }
