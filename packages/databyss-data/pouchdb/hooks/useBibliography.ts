import { useEffect } from 'react'
import {
  BlockType,
  CitationFormatOptions,
  Source,
  Text,
} from '@databyss-org/services/interfaces'
import { toCitation } from '@databyss-org/services/citations'
import { useQuery, useQueryClient } from 'react-query'
import { useBlocksInPages } from '.'

interface BibliographyDict {
  [blockId: string]: {
    citation: Text
    source: Source
  }
}

export const useBibliography = (formatOptions: CitationFormatOptions) => {
  const queryClient = useQueryClient()
  const blocksInPagesRes = useBlocksInPages<Source>(BlockType.Source)

  const queryKey = ['bibliography', formatOptions]
  const query = useQuery<BibliographyDict>(
    queryKey,
    async () => {
      const dict: BibliographyDict = {}
      for (const source of blocksInPagesRes.data!) {
        const citation = source.detail
          ? await toCitation(source.detail, formatOptions)
          : null
        dict[source._id] = { citation, source }
      }
      return dict
    },
    {
      enabled: blocksInPagesRes.isSuccess,
    }
  )

  useEffect(
    () => () => {
      queryClient.removeQueries(queryKey)
    },
    []
  )

  return query
}
