import { useEffect } from 'react'
import {
  BlockType,
  CitationFormatOptions,
  Source,
  BibliographyDict,
  BibliographyItem,
} from '@databyss-org/services/interfaces'
import { toCitation } from '@databyss-org/services/citations'
import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import { useBlocksInPages } from '.'
import { useDocuments } from './useDocuments'
import { UseDocumentOptions } from './useDocument'
import { selectors } from '../selectors'
import {
  filterBibliographyByAuthor,
  sortBibliography,
} from '@databyss-org/services/sources/lib'

interface UseBibliographyOptions extends UseDocumentOptions {
  formatOptions: CitationFormatOptions
  sourceIds?: string[]
  filterByAuthor?: [string, string]
}

export const useBibliography = ({
  formatOptions,
  sourceIds,
  subscribe,
  ...otherOptions
}: UseBibliographyOptions) => {
  // console.log('[useBibliography] formatOptions', formatOptions)
  const blocksInPagesRes = useBlocksInPages<Source>(BlockType.Source, {
    enabled: !sourceIds,
    subscribe,
  })
  const blocksByIdRes = useDocuments<Source>(sourceIds ?? selectors.SOURCES, {
    enabled: !!sourceIds,
    subscribe,
  })

  const sources = () =>
    blocksByIdRes.isSuccess && sourceIds
      ? Object.values(blocksByIdRes.data!)
      : blocksInPagesRes.data

  const queryKey = [
    'bibliography',
    sourceIds,
    sourceIds ? blocksByIdRes.dataUpdatedAt : blocksInPagesRes.dataUpdatedAt,
    formatOptions.styleId,
  ]
  const query = useQuery<BibliographyItem[]>({
    queryFn: () =>
      // console.log('[useBibliogaphy] query', queryKey)
      bibliographyFromSources(sources()!, formatOptions),
    enabled: sourceIds ? blocksByIdRes.isSuccess : blocksInPagesRes.isSuccess,
    ...(otherOptions as UseQueryOptions<BibliographyItem[]>),
    queryKey,
  })

  return query
}

export async function bibliographyFromSources(
  sources: Source[],
  formatOptions: CitationFormatOptions
): Promise<BibliographyItem[]> {
  if (!sources) {
    return []
  }
  let items: BibliographyItem[] = []
  for (const source of sources!) {
    const citation = source.detail
      ? await toCitation(source.detail, formatOptions)
      : null
    items.push({ citation, source, citationStyle: formatOptions.styleId })
  }
  items = sortBibliography(items)
  return items
}
