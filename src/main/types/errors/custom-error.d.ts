import type { Bodyable } from './http-error.d.ts'

export interface CustomErrorParams extends Partial<Bodyable> {
  extra?: unknown
  message?: string
  origin?: Error
}

export interface CustomErrorable extends Error {
  extra?: unknown
  origin?: Error
}

export interface StaticCustomError<T extends CustomErrorable = CustomErrorable> {
  new (params?: CustomErrorParams): T
}
