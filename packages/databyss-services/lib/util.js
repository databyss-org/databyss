import { ResourcePending } from '../interfaces'

export const resourceIsReady = resource =>
  resource &&
  !(resource instanceof ResourcePending) &&
  !(resource instanceof Error)
