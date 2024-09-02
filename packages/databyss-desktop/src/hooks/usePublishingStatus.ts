import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@databyss-org/services/lib/queryClient'
import { PublishingStatus } from '../eapi/handlers/publish-handlers'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../databyss-desktop/src/eapi').default

export const usePublishingStatus = (statusId: string) => {
  return useQuery<PublishingStatus>({
    queryKey: [`publishingStatus_${statusId}`],
    queryFn: async () => {
      const _res = await eapi.publish.getPublishingStatus(statusId)
      return _res ?? null
    },
    refetchInterval: 500,
  })
}

eapi.publish.onStatusUpdated((statusId, value) => {
  queryClient.setQueryData([`publishingStatus_${statusId}`], value)
})
