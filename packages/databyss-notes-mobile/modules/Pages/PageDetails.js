import React, { useState } from 'react'
import {
  useParams,
  useLocation,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { EditorPageLoader } from '@databyss-org/ui/components/Loaders'
import { PageContainer } from '@databyss-org/ui/components/PageContent/PageContent'

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
  const renderPageDetails = (page) => (
    <PageContainer
      anchor={anchor}
      id={pageId}
      page={page}
      maxHeight={getScrollViewMaxHeight()}
      isReadOnly
    />
  )

  const render = () => (
    <MobileView headerItems={buildHeaderItems(pageTitle, pageId)}>
      <EditorPageLoader pageId={pageId} key={pageId} firstBlockIsTitle>
        {(page) => {
          setPageTitle(page.name)
          return renderPageDetails(page)
        }}
      </EditorPageLoader>
    </MobileView>
  )

  return render()
}

export default PageDetails
