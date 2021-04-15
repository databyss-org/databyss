import React from 'react'
import {
  useBlocks,
  useBlockRelations,
  usePages,
} from '@databyss-org/data/pouchdb/hooks'
import { LoadingFallback } from '@databyss-org/ui/components'
import { getBlocksFromBlockRelations } from '@databyss-org/services/blocks/joins'
import { MobileView } from '../Mobile'
import { buildListItems } from '../../utils/buildListItems'
import NoResultsView from '../../components/NoResultsView'
import ScrollableListView from '../../components/ScrollableListView'

import TopicsMetadata from './TopicsMetadata'

// consts
const headerItems = [TopicsMetadata]

// component
const TopicsIndex = () => {
  const blockRelationsRes = useBlockRelations('TOPIC')
  const pagesRes = usePages()
  const blocksRes = useBlocks('TOPIC')

  const queryRes = [blockRelationsRes, blocksRes, pagesRes]

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  // removes atomics not appearing on pages
  const _filteredTopics = getBlocksFromBlockRelations(
    blockRelationsRes.data,
    blocksRes.data,
    pagesRes.data,
    false
  )

  const listItems = buildListItems({
    data: _filteredTopics,
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
