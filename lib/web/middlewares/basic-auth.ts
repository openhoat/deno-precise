import { decode, encode } from '../../../deps/std.ts'
import {
  RequestWithRouteParams,
  WebServerable,
} from '../../types/web/web-server.d.ts'
import { asPromise } from '../../helper.ts'

export type CredentialsChecker = (
  username: string,
  password?: string,
) => boolean | Promise<boolean>

export const authorizationHeaderName = 'Authorization'

export const basicAuthHeaderRegExp = new RegExp('^Basic (.*)$', 'i')

export const decodeBase64BasicAuthCredentials = (
  basicAuthValue: string,
): { username: string; password?: string } => {
  const [username, password] = new TextDecoder().decode(decode(basicAuthValue))
    .split(':')
  return { username, password }
}

export const encodeBase64BasicAuthCredentials = (
  username: string,
  password?: string,
): string => encode([username, password].join(':'))

export const parseBasicAuth = (
  req: RequestWithRouteParams,
): { username: string; password?: string } | undefined => {
  const authorizationHeader = req.headers.get(authorizationHeaderName)
  if (!authorizationHeader) {
    return
  }
  const basicAuthHeaderMatches = authorizationHeader.match(
    basicAuthHeaderRegExp,
  )
  if (basicAuthHeaderMatches?.length !== 2) {
    return
  }
  const [, basicAuthValue = ''] = basicAuthHeaderMatches
  return decodeBase64BasicAuthCredentials(basicAuthValue)
}

export const basicAuthChecker = (credentialsChecker: CredentialsChecker) =>
  async function (this: WebServerable, req: RequestWithRouteParams) {
    const credentials = parseBasicAuth(req)
    if (
      !credentials ||
      !(await asPromise(
        credentialsChecker(credentials.username, credentials.password),
      ))
    ) {
      return Response.json(
        {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized.',
        },
        { status: 401 },
      )
    }
    this.logger.debug(
      `Found basic authorization with username ${credentials.username}`,
    )
  }
