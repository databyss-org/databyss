import { useQuery, UseQueryOptions } from 'react-query'
import { httpPost } from '../../../databyss-services/lib/requestApi'

export const useRemoteMedia = (
  // should be url
  url: string,
  options: UseQueryOptions
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
