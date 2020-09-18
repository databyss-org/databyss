import React from 'react'
import { Helmet } from 'react-helmet'
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
            <Helmet>
              <meta charSet="utf-8" />
              <title>{topicTitle}</title>
            </Helmet>
            <PagesLoader filtered>
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
