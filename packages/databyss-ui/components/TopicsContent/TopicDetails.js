import React from 'react'
import {
  TopicLoader,
  BlockRelationsLoader,
  PagesLoader,
} from '@databyss-org/ui/components/Loaders'

import { useParams } from '@reach/router'
import IndexPageContent from '../PageContent/IndexPageContent'
import IndexSourceContent from '../SourcesContent/IndexSourceContent'

const TopicDetails = () => {
  const { id } = useParams()
  return (
    <TopicLoader topicId={id}>
      {topic => {
        const topicTitle = topic.text.textValue

        return (
          <IndexPageContent title={topicTitle}>
            <PagesLoader>
              {() => (
                <BlockRelationsLoader atomicId={id}>
                  {relations => <IndexSourceContent relations={relations} />}
                </BlockRelationsLoader>
              )}
            </PagesLoader>
          </IndexPageContent>
        )
      }}
    </TopicLoader>
  )
}

export default TopicDetails
