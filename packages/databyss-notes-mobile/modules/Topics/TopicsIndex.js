import React from 'react'
import { useBlocks } from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'
// import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
// import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import { MobileView } from '../Mobile'
import { buildListItems } from '../../utils/buildListItems'
import NoResultsView from '../../components/NoResultsView'
import ScrollableListView from '../../components/ScrollableListView'

import TopicsMetadata from './TopicsMetadata'

// consts
const headerItems = [TopicsMetadata]

// component
const TopicsIndex = () => {
  const blocksRes = useBlocks('TOPIC')
  if (!blocksRes.isSuccess) {
    return <LoadingFallback queryObserver={blocksRes} />
  }
  const topics = Object.values(blocksRes.data)

  const listItems = buildListItems({
    data: topics,
    baseUrl: '/topics',
    labelPropPath: 'text.textValue',
    icon: TopicsMetadata.icon,
  })

  // render methods
  const render = () => (
    <MobileView headerItems={headerItems}>
      {listItems.length ? (
        <ScrollableListView listItems={listItems} />
      ) : (
        <NoResultsView text="No topic found" />
      )}
    </MobileView>
  )

  return render()
}

export default TopicsIndex
