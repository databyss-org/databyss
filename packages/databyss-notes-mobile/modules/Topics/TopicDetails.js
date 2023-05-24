import React from 'react'
import { useBlockRelations, useBlocks } from '@databyss-org/data/pouchdb/hooks'
import { useParams } from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { BlockType } from '@databyss-org/services/interfaces'
import { LoadingFallback } from '@databyss-org/ui/components'
import { ScrollView } from '@databyss-org/ui/primitives'
import { IndexPageContent } from '@databyss-org/ui/modules'
import { getScrollViewMaxHeight } from '../../utils/getScrollViewMaxHeight'
import { MobileView } from '../Mobile'
// import { getScrollViewMaxHeight } from '../../utils/getScrollViewMaxHeight'

import TopicsMetadata from './TopicsMetadata'

const buildHeaderItems = (title, id) => [
  TopicsMetadata,
  {
    title,
    url: `${TopicsMetadata.url}/${id}`,
  },
]

// component
const TopicDetails = () => {
  const { topicId } = useParams()

  const blockRelationRes = useBlockRelations(BlockType.Topic)
  const topicsRes = useBlocks(BlockType.Topic)
  const queryRes = [blockRelationRes, topicsRes]

  let pageTitle = 'Loading...'

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  pageTitle = topicsRes.data[topicId]?.text.textValue

  // render methods
  const renderTopicDetails = () => (
    <ScrollView maxHeight={getScrollViewMaxHeight()} flexGrow={1}>
      <IndexPageContent blockType="TOPIC" />
    </ScrollView>
  )

  const render = () => (
    <MobileView headerItems={buildHeaderItems(pageTitle, topicId)}>
      {renderTopicDetails()}
    </MobileView>
  )

  return render()
  // return <div>topics detail section</div>
}

export default TopicDetails
