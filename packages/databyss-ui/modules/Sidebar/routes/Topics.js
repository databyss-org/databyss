import React from 'react'
import {
  sortEntriesAtoZ,
  filterEntries,
  createSidebarListItems,
} from '@databyss-org/services/entries/util'
import SidebarList from '@databyss-org/ui/components/Sidebar/SidebarList'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import { useBlockRelations, useBlocks } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/editor/interfaces'
import { joinBlockRelationsWithBlocks } from '@databyss-org/services/blocks'
import LoadingFallback from '@databyss-org/ui/components/Notify/LoadingFallback'

export const getTopicsData = (topics) =>
  Object.values(topics).map((value) =>
    createSidebarListItems({
      text: value.text.textValue,
      type: 'topics',
      route: '/topics',
      id: value._id,
      params: value._id,
      icon: <TopicSvg />,
    })
  )

const Topics = ({ filterQuery, height }) => {
  const topicsRes = useBlocks(BlockType.Topic)
  const blockRelationsRes = useBlockRelations(BlockType.Topic)

  if (!blockRelationsRes.isSuccess || !topicsRes.isSuccess) {
    return <LoadingFallback />
  }

  const topics = joinBlockRelationsWithBlocks(
    blockRelationsRes.data,
    topicsRes.data
  )

  const topicsData = getTopicsData(topics)
  const sortedTopics = sortEntriesAtoZ(topicsData, 'text')
  const filteredEntries = filterEntries(sortedTopics, filterQuery)

  return (
    <SidebarList
      menuItems={filterQuery.textValue === '' ? sortedTopics : filteredEntries}
      height={height}
    />
  )
}

export default Topics
