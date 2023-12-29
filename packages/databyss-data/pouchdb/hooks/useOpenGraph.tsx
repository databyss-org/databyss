import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { EmbedDetail } from '@databyss-org/services/interfaces/Block'
// import { httpPost } from '@databyss-org/services/lib/requestApi'
import { opengraph } from '@databyss-org/services/embeds/remoteMedia'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../databyss-desktop/src/eapi').default

export const useOpenGraph = (
  // should be url
  url: string,
  options?: UseQueryOptions
) => {
  const queryKey = [url]

  const query = useQuery<EmbedDetail>(
    queryKey,
    async () => {
      // const _res = await httpPost('/media/opengraph', { url })
      // return opengraph(url)
      return eapi.file.getEmbedDetail(url)
    },
    options as UseQueryOptions<EmbedDetail>
  )

  return query
}
