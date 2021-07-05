import { useQuery, UseQueryOptions } from 'react-query'
import { httpPost } from '../../../databyss-services/lib/requestApi'

export const useOpenGraph = (
  // should be url
  url: string,
  options: UseQueryOptions
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
