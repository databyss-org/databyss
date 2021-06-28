import { useQuery } from 'react-query'
import { httpPost } from '../../../databyss-services/lib/requestApi'

export interface QueryOptions {
  includeIds?: string[] | null
}

export interface UseDocumentsOptions extends QueryOptions {
  enabled?: boolean
}

export const useOpenGraph = (
  // should be url
  url: string,
  options: UseDocumentsOptions = { enabled: true }
) => {
  const queryKey = url

  const query = useQuery(
    queryKey,
    async () => {
      const _res = await httpPost('/media/opengraph', { url })
      return _res
    },
    {
      enabled: options.enabled,
    }
  )

  return query
}
