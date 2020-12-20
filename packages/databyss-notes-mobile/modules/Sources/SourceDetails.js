import React, { useState } from 'react'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'

import { ScrollView } from '@databyss-org/ui/primitives'
import { PageProvider } from '@databyss-org/services'
import EntryProvider from '@databyss-org/services/entries/EntryProvider'
import IndexSourceContent from '@databyss-org/ui/components/SourcesContent/IndexSourceContent'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import {
  BlockRelationsLoader,
  PagesLoader,
  SourceCitationsLoader,
} from '@databyss-org/ui/components/Loaders'
import { getScrollViewMaxHeight } from '../../utils/getScrollViewMaxHeight'
import { MobileView } from '../Mobile'
import SourcesMetadata from './SourcesMetadata'

const buildHeaderItems = (title, id) => [
  SourcesMetadata,
  {
    title,
    url: `${SourcesMetadata.url}/${id}`,
  },
]

// component
const SourceDetails = () => {
  const { sourceId } = useParams()

  const [pageTitle, setPageTitle] = useState('Loading...')

  // render methods
  const renderSourceDetails = () => (
    <ScrollView maxHeight={getScrollViewMaxHeight()} pr="medium" py="large">
      <PageProvider>
        <PagesLoader>
          {() => (
            <EntryProvider>
              <BlockRelationsLoader atomicId={sourceId}>
                {(relations) => <IndexSourceContent relations={relations} />}
              </BlockRelationsLoader>
            </EntryProvider>
          )}
        </PagesLoader>
      </PageProvider>
    </ScrollView>
  )

  const render = () => (
    <MobileView headerItems={buildHeaderItems(pageTitle, sourceId)}>
      <SourceProvider>
        <SourceCitationsLoader>
          {(citations) => {
            const heading = citations[sourceId].text.textValue
            setPageTitle(heading)
            return renderSourceDetails()
          }}
        </SourceCitationsLoader>
      </SourceProvider>
    </MobileView>
  )

  return render()
}

export default SourceDetails
