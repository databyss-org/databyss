import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { EmbedDetail } from '@databyss-org/services/interfaces/Block'
import { httpPost } from '@databyss-org/services/lib/requestApi'

export const useOpenGraph = (
  // should be url
  url: string,
  options?: UseQueryOptions
) => {
  const queryKey = [url]

  const query = useQuery<EmbedDetail>(
    queryKey,
    async () => {
      const _res = await httpPost('/media/opengraph', { url })
      return _res as EmbedDetail
    },
    options as UseQueryOptions<EmbedDetail>
  )

  return query
}
