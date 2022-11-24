import { OnSendHookHandler } from '../../types/web/web-server.d.ts'
import preciseVersion from '../../../../version.json' assert { type: 'json' }

const exposeVersion: (name?: string, version?: string) => OnSendHookHandler = (
  name = 'Precise',
  version = preciseVersion,
) =>
  function versionHeader(response) {
    response.headers.set('X-Powered-By', `${name}/${version}`)
  }

export { exposeVersion }
