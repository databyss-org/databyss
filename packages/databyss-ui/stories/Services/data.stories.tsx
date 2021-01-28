import React, { ReactNode } from 'react'
import { storiesOf } from '@storybook/react'
import { Text, List } from '@databyss-org/ui/primitives'
import { useBlock, useBlockRelations } from '@databyss-org/data/pouchdb/queries'
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
  const res = useBlockRelations(BlockType.Topic)
  if (!res.isSuccess) {
    return <Text>...</Text>
  }
  const _topics = Object.keys(
    res.data!.reduce((_topics, _relation) => {
      _topics[_relation.relatedBlock] = true
      return _topics
    }, {})
  )

  return withLoader(
    res,
    <List>
      {sortEntriesAtoZ(_topics).map((_relation) => (
        <BlockText id={_relation.relatedBlock} key={_relation._id} />
      ))}
    </List>
  )
}

storiesOf('Services|Data', module)
  .addDecorator(ViewportDecorator)
  .addDecorator(QueryProviderDecorator)
  .add('Topics on Pages (from BlockRelations)', () => <AllTopics />)
  .add('Single block', () => <BlockText id="3B5y9lAIHk2Q" />)
