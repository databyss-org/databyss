import React from 'react'
import { storiesOf } from '@storybook/react'
import { Text, List } from '@databyss-org/ui/primitives'
import { useBlockRelations, useBlock } from '@databyss-org/data/pouchdb'
import { ViewportDecorator } from '../decorators'
import { BlockType } from '@databyss-org/editor/interfaces'

const BlockText = ({ id }: { id: string }) => {
  const _block = useBlock(id)
  return <Text>{_block.text.textValue}</Text>
}

const AllTopics = () => {
  const _blockRelations = useBlockRelations(BlockType.Topic)
  return (
    <List>
      {_blockRelations.map((_relation) => (
        <BlockText id={_relation.relatedBlock} />
      ))}
    </List>
  )
}

storiesOf('Services|Data', module)
  .addDecorator(ViewportDecorator)
  .add('Topics on Pages (from BlockRelations)', () => <AllTopics />)
