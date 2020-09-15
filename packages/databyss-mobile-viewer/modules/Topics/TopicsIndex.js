import React from 'react'

import { AllTopicsLoader } from '@databyss-org/ui/components/Loaders'
import { MobileView } from '@databyss-org/ui/primitives'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'

import { buildListItems } from '../../utils/buildListItems'
import NoResultsView from '../../components/NoResultsView'
import ScrollableListView from '../../components/ScrollableListView'

import TopicsMetadata from './TopicsMetadata'

// consts
const headerItems = [TopicsMetadata]

// component
const TopicsIndex = () => {
  // render methods
  const render = () => (
    <TopicProvider>
      <MobileView headerItems={headerItems}>
        <AllTopicsLoader>
          {topics => {
            const listItems = buildListItems({
              data: topics,
              baseUrl: '/topics',
              labelPropPath: 'text.textValue',
              icon: TopicsMetadata.icon,
            })

            return listItems.length ? (
              <ScrollableListView listItems={listItems} />
            ) : (
              <NoResultsView text="No topic found" />
            )
          }}
        </AllTopicsLoader>
      </MobileView>
    </TopicProvider>
  )

  return render()
}

export default TopicsIndex
