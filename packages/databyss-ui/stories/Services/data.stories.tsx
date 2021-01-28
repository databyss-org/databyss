import React, { ReactNode } from 'react'
import { storiesOf } from '@storybook/react'
import { Text, List } from '@databyss-org/ui/primitives'
import { useBlockRelations, useBlock } from '@databyss-org/data/pouchdb/hooks'
import { BlockType, Block } from '@databyss-org/services/interfaces'
import { ViewportDecorator } from '../decorators'

const withLoader = (res: any, element: ReactNode) =>
  res ? <>{element}</> : null

const BlockText = ({ id }: { id: string }) => {
  const _block = useBlock<Block>(id)
  return withLoader(_block, <Text>{_block?.text.textValue}</Text>)
}

const AllTopics = () => {
  const _blockRelations = useBlockRelations(BlockType.Topic)
  return withLoader(
    _blockRelations,
    <List>
      {_blockRelations?.map((_relation) => (
        <BlockText id={_relation.relatedBlock} key={_relation._id} />
      ))}
    </List>
  )
}

storiesOf('Services|Data', module)
  .addDecorator(ViewportDecorator)
  .add('Topics on Pages (from BlockRelations)', () => <AllTopics />)
