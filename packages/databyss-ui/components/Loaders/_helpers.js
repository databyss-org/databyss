import { ResourcePending } from '@databyss-org/services/interfaces/ResourcePending'

export const isResourceReady = resource => {
  if (
    resource &&
    !(resource instanceof ResourcePending) &&
    !(resource instanceof Error)
  ) {
    return true
  }
  return false
}
