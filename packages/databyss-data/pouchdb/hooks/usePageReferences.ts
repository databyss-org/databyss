import { BlockType, Page } from '@databyss-org/services/interfaces'
import { QueryObserverResult } from '@tanstack/react-query'
import { useBlockRelations, usePages } from '.'

export const usePageReferences = (
  pageId: string
): QueryObserverResult<Page[]> => {
  const blockRelationsRes = useBlockRelations(BlockType.Link)
  const pagesRes = usePages()

  const incompleteRes = [blockRelationsRes, pagesRes].find((r) => !r.isSuccess)
  if (incompleteRes) {
    return incompleteRes as QueryObserverResult<Page[]>
  }

  let _pages: Page[] = []
  const _relation = blockRelationsRes?.data?.[`r_${pageId}`]
  if (_relation) {
    _pages = _relation.pages
      .map((i) => pagesRes?.data![i])
      .filter((i) => !!i && !i.archive)
  }

  return {
    ...blockRelationsRes,
    data: _pages,
  } as QueryObserverResult<Page[]>
}
