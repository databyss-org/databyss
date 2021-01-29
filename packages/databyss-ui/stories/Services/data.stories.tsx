import React, { ReactNode } from 'react'
import { storiesOf } from '@storybook/react'
import { Text, List } from '@databyss-org/ui/primitives'
import {
  useBlock,
  useBlockRelations,
  useBlocks,
} from '@databyss-org/data/pouchdb/hooks'
import { BlockType, Block } from '@databyss-org/services/interfaces'
import {
  QueryObserverResult,
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import { ViewportDecorator } from '../decorators'
import { sortEntriesAtoZ } from '@databyss-org/services/entries/util'

const queryClient = new QueryClient()
export const QueryProviderDecorator = (storyFn) => (
  <QueryClientProvider client={queryClient}>{storyFn()}</QueryClientProvider>
)

const withLoader = (res: QueryObserverResult, element: ReactNode) =>
  res.status === 'success' ? <>{element}</> : <Text>...</Text>

const BlockText = ({ id }: { id: string }) => {
  const res = useBlock<Block>(id)
  return withLoader(res, <Text>{res.data?.text.textValue}</Text>)
}

const AllTopics = () => {
  const _blockRelationsRes = useBlockRelations(BlockType.Topic)
  const _topicsRes = useBlocks(BlockType.Topic)

  if (!_blockRelationsRes.isSuccess || !_topicsRes.isSuccess) {
    return <Text>...</Text>
  }

  const _topics: Block[] = Object.values(
    Object.values(_blockRelationsRes.data).reduce((_topics, _relation) => {
      _topics[_relation.relatedBlock] = _topicsRes.data[_relation.relatedBlock]
      return _topics
    }, {})
  )

  // sortEntriesAtoZ(_topics, '')

  return (
    <List>
      {_topics.map((_topic) => (
        <Text key={_topic._id}>{_topic.text.textValue}</Text>
      ))}
    </List>
  )
}

storiesOf('Services|Data', module)
  .addDecorator(ViewportDecorator)
  .addDecorator(QueryProviderDecorator)
  .add('Topics on Pages (from BlockRelations)', () => <AllTopics />)
  .add('Single block', () => <BlockText id="3B5y9lAIHk2Q" />)
