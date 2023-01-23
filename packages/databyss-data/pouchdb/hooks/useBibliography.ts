import { useEffect } from 'react'
import {
  BlockType,
  CitationFormatOptions,
  Source,
  BibliographyDict,
} from '@databyss-org/services/interfaces'
import { toCitation } from '@databyss-org/services/citations'
import { useQuery, useQueryClient, UseQueryOptions } from 'react-query'
import { useBlocksInPages } from '.'
import { useDocuments } from './useDocuments'
import { UseDocumentOptions } from './useDocument'
import { selectors } from '../selectors'

interface UseBibliographyOptions extends UseDocumentOptions {
  formatOptions: CitationFormatOptions
  sourceIds?: string[]
}

export const useBibliography = ({
  formatOptions,
  sourceIds,
  subscribe,
  ...otherOptions
}: UseBibliographyOptions) => {
  const queryClient = useQueryClient()
  const blocksInPagesRes = useBlocksInPages<Source>(BlockType.Source, {
    enabled: !sourceIds,
    subscribe,
  })
  const blocksByIdRes = useDocuments<Source>(sourceIds ?? selectors.SOURCES, {
    enabled: !!sourceIds,
    subscribe,
  })

  const sources =
    blocksByIdRes.isSuccess && sourceIds
      ? Object.values(blocksByIdRes.data!)
      : blocksInPagesRes.data

  const queryKey = ['bibliography', formatOptions, sourceIds]
  const query = useQuery<BibliographyDict>(
    queryKey,
    () => bibliographyFromSources(sources!, formatOptions),
    {
      enabled: sourceIds ? blocksByIdRes.isSuccess : blocksInPagesRes.isSuccess,
      ...(otherOptions as UseQueryOptions<BibliographyDict>),
    }
  )

  const updateBibliography = async () => {
    if (!sources) {
      return
    }
    const _bibDict = await bibliographyFromSources(sources!, formatOptions)
    if (_bibDict) {
      console.log('[updateBibliography]', queryKey, sources)
      queryClient.setQueryData<BibliographyDict>(queryKey, _bibDict)
    }
  }

  useEffect(() => {
    updateBibliography()
  }, [blocksByIdRes.dataUpdatedAt])

  return query
}

async function bibliographyFromSources(
  sources: Source[],
  formatOptions: CitationFormatOptions
): Promise<BibliographyDict> {
  if (!sources) {
    return {}
  }
  const dict: BibliographyDict = {}
  for (const source of sources!) {
    const citation = source.detail
      ? await toCitation(source.detail, formatOptions)
      : null
    dict[source._id] = { citation, source }
  }
  return dict
}
