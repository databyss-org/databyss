import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@databyss-org/services/lib/queryClient'
import { PublishingStatus } from '../eapi/handlers/publish-handlers'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../databyss-desktop/src/eapi').default

export interface UsePublishingStatusOptions {
  enabled?: boolean
}

export const usePublishingStatus = (
  statusId: string,
  { enabled = true }: UsePublishingStatusOptions
) => {
  return useQuery<PublishingStatus>({
    queryKey: [`publishingStatus_${statusId}`],
    queryFn: () => eapi.publish.getPublishingStatus(statusId),
    enabled,
  })
}

eapi.publish.onStatusUpdated((statusId, value) => {
  queryClient.setQueryData([`publishingStatus_${statusId}`], value)
})
