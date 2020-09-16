import React, { useState } from 'react'
import { useParams, useLocation } from '@reach/router'

import { ScrollView } from '@databyss-org/ui/primitives'
import { PageContainer } from '@databyss-org/ui/components/PageContent/PageContent'
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import PageProvider from '@databyss-org/services/pages/PageProvider'
import { MobileView } from '../Mobile'

import { getScrollViewMaxHeight } from '../../utils/getScrollViewMaxHeight'

import PagesMetadata from './PagesMetadata'

const buildHeaderItems = (title, id) => [
  PagesMetadata,
  {
    title,
    url: `${PagesMetadata.url}/${id}`,
  },
]

// component
const PageDetails = () => {
  const { pageId } = useParams()
  const anchor = useLocation().hash.substring(1)

  const [pageTitle, setPageTitle] = useState('Loading...')

  // render methods
  const renderPageDetails = page => (
    <NotifyProvider>
      <PageContainer
        anchor={anchor}
        id={pageId}
        page={page}
        maxHeight={getScrollViewMaxHeight()}
      />
    </NotifyProvider>
  )

  const render = () => (
    <MobileView headerItems={buildHeaderItems(pageTitle, pageId)}>
      <PageProvider>
        <PageLoader pageId={pageId}>
          {page => {
            setPageTitle(page.name)
            return renderPageDetails(page)
          }}
        </PageLoader>
      </PageProvider>
    </MobileView>
  )

  return render()
}

export default PageDetails
