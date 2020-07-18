import React from 'react'
import { TopicLoader } from '@databyss-org/ui/components/Loaders'

import { useParams } from '@reach/router'
import IndexPageContent from '../PageContent/IndexPageContent'

const TopicDetails = () => {
  const { id } = useParams()

  return (
    <TopicLoader topicId={id}>
      {topic => {
        const topicTitle = topic.text.textValue

        return <IndexPageContent title={topicTitle} />
      }}
    </TopicLoader>
  )
}

export default TopicDetails
