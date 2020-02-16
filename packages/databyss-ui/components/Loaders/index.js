import React from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import makeLoader from './makeLoader'

export const PageLoader = makeLoader(({ pageId }) => {
  const { getPage } = usePageContext()
  return getPage(pageId)
})

export const withPage = Wrapped => ({ pageId, ...others }) => (
  <PageLoader pageId={pageId}>
    {page => <Wrapped page={page} {...others} />}
  </PageLoader>
)

export const PagesLoader = makeLoader(() => {
  const { getPages } = usePageContext()
  return getPages()
})

export const withPages = Wrapped => ({ ...others }) => (
  <PagesLoader>{pages => <Wrapped pages={pages} {...others} />}</PagesLoader>
)
