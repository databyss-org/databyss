import { useEffect } from 'react'
import {
  BlockType,
  CitationFormatOptions,
  Source,
} from '@databyss-org/services/interfaces'
import { toCitation } from '@databyss-org/services/citations'
import { useQuery, useQueryClient, UseQueryOptions } from 'react-query'
import { useBlocksInPages } from '.'
import { useDocuments } from './useDocuments'
import { isCurrentAuthor } from '../../../databyss-services/sources/lib'

export interface AuthorName {
  firstName: string | null
  lastName: string | null
}

export interface BibliographyItem {
  citation: string
  source: Source
}

export interface BibliographyDict {
  [blockId: string]: BibliographyItem
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

export function sortBibliography(items: BibliographyItem[]) {
  const getSortablePart = (source: Source) =>
    // if author(s) exist, sort by last name (or first if no last)
    source.detail?.authors?.length
      ? source.detail.authors[0].lastName?.textValue ??
        source.detail.authors[0].firstName?.textValue
      : // otherwise sort by textValue
        source.text.textValue

  return items.sort((a, b) =>
    getSortablePart(a.source).toLowerCase() >
    getSortablePart(b.source).toLowerCase()
      ? 1
      : -1
  )
}

export function filterBibliographyByAuthor({
  items,
  author,
}: {
  items: BibliographyItem[]
  author: AuthorName
}) {
  return items.filter((s) =>
    isCurrentAuthor(s.source.detail?.authors, author.firstName, author.lastName)
  )
}
