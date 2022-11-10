export enum HttpMethods {
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PURGE = 'PURGE',
  PUT = 'PUT',
  TRACE = 'TRACE',
}

export enum HttpMethodSpecs {
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PURGE = 'PURGE',
  PUT = 'PUT',
  TRACE = 'TRACE',
  ALL = 'ALL',
}

export const hostnameForDisplay = (hostname?: string): string => {
  // If the hostname is "0.0.0.0", we display "localhost" in console
  // because browsers in Windows don't resolve "0.0.0.0".
  // See the discussion in https://github.com/denoland/deno_std/issues/1165
  return !hostname || hostname === '0.0.0.0' ? 'localhost' : hostname
}
