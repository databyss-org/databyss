import { useEffect } from 'react'
import {
  BlockType,
  CitationFormatOptions,
  Source,
  Text,
} from '@databyss-org/services/interfaces'
import { toCitation } from '@databyss-org/services/citations'
import { useQuery, useQueryClient, UseQueryOptions } from 'react-query'
import { useBlocksInPages } from '.'
import { useDocuments } from './useDocuments'

interface BibliographyDict {
  [blockId: string]: {
    citation: Text
    source: Source
  }
}

interface UseBibliographyOptions extends UseQueryOptions {
  formatOptions: CitationFormatOptions
  sourceIds?: string[]
}

export const useBibliography = ({
  formatOptions,
  sourceIds,
  ...otherOptions
}: UseBibliographyOptions) => {
  const queryClient = useQueryClient()
  const blocksInPagesRes = useBlocksInPages<Source>(BlockType.Source, {
    enabled: !sourceIds,
  })
  const blocksByIdRes = useDocuments<Source>(sourceIds ?? [], {
    enabled: !!sourceIds,
  })

  const queryKey = ['bibliography', formatOptions, sourceIds]
  const query = useQuery<BibliographyDict>(
    queryKey,
    async () => {
      const dict: BibliographyDict = {}
      const sources = sourceIds
        ? Object.values(blocksByIdRes.data!)
        : blocksInPagesRes.data
      for (const source of sources!) {
        const citation = source.detail
          ? await toCitation(source.detail, formatOptions)
          : null
        dict[source._id] = { citation, source }
      }
      return dict
    },
    {
      enabled: sourceIds ? blocksByIdRes.isSuccess : blocksInPagesRes.isSuccess,
      ...(otherOptions as UseQueryOptions<BibliographyDict>),
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
