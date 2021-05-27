import { useQuery } from 'react-query'
import { httpPost } from '../../../databyss-services/lib/requestApi'

export interface QueryOptions {
  includeIds?: string[] | null
}

export interface UseDocumentsOptions extends QueryOptions {
  enabled?: boolean
}

export const useRemoteMedia = (
  // should be url
  url: string,
  options: UseDocumentsOptions = { enabled: true }
) => {
  const queryKey = `media-${url}`

  const query = useQuery(
    queryKey,
    async () => {
      const _res = await httpPost('/media/remote', { url })
      return _res
    },
    {
      enabled: options.enabled,
    }
  )

  return query
}
