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
import { filterBibliographyByAuthor, sortBibliography } from '@databyss-org/services/sources/lib'

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
  const queryClient = useQueryClient()
  const blocksInPagesRes = useBlocksInPages<Source>(BlockType.Source, {
    enabled: !sourceIds,
    subscribe,
  })
  const blocksByIdRes = useDocuments<Source>(sourceIds ?? selectors.SOURCES, {
    enabled: !!sourceIds,
    subscribe,
  })

  const sources: Source[] | undefined =
    blocksByIdRes.isSuccess && sourceIds
      ? Object.values(blocksByIdRes.data!)
      : blocksInPagesRes.data

  const queryKey = ['bibliography', formatOptions, sourceIds]
  const query = useQuery<BibliographyItem[]>({
    queryFn: () => bibliographyFromSources(sources!, formatOptions),
    enabled: sourceIds ? blocksByIdRes.isSuccess : blocksInPagesRes.isSuccess,
    ...(otherOptions as UseQueryOptions<BibliographyItem[]>),
    queryKey,
  })

  const updateBibliography = async () => {
    if (!sources) {
      return
    }
    const _bib = await bibliographyFromSources(sources!, formatOptions)
    if (_bib) {
      queryClient.setQueryData<BibliographyItem[]>(queryKey, _bib)
    }
  }

  useEffect(() => {
    updateBibliography()
  }, [blocksByIdRes.dataUpdatedAt])

  return query
}

async function bibliographyFromSources(
  sources: Source[],
  formatOptions: CitationFormatOptions,
): Promise<BibliographyItem[]> {
  if (!sources) {
    return []
  }
  let items: BibliographyItem[] = []
  for (const source of sources!) {
    const citation = source.detail
      ? await toCitation(source.detail, formatOptions)
      : null
    items.push({ citation, source })
  }
  items = sortBibliography(items)
  return items
}
