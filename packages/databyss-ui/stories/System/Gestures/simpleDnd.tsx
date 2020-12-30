import React from 'react'
import { View, Text, Grid, useDrop, useDrag } from '@databyss-org/ui/primitives'

// follows react-dnd "simple" example
// https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_hooks_js/01-dustbin/single-target?from-embed=&file=/src/Container.jsx

const ItemTypes = {
  BOX: 'box',
}

const Dropzone = () => {
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: ItemTypes.BOX,
    drop: () => ({ name: 'Dustbin' }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  const isActive = isOver && canDrop
  let bg = 'background.2'
  if (isActive) {
    bg = 'orange.0'
  } else {
    bg = 'orange.1'
  }

  return (
    <View
      ref={dropRef}
      bg={bg}
      paddingVariant="small"
      widthVariant="dialog"
      width="100%"
    />
  )
}

const DraggableBox = ({ name }: { name: string }) => {
  const [{ isDragging }, dragRef] = useDrag({
    item: { name, type: ItemTypes.BOX },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      if (item && dropResult) {
        alert(`You dropped ${item.name} into ${dropResult.name}!`)
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  return (
    <View
      ref={dragRef}
      opacity={isDragging ? 0.4 : 1}
      borderVariant="thinLight"
      paddingVariant="small"
      m="small"
      bg="background.0"
      css={{
        // note this is necessary to remove extra junk around the edges of the
        // drag preview. see: https://github.com/react-dnd/react-dnd/issues/788#issuecomment-393620979
        transform: 'translate(0, 0)',
      }}
    >
      <Text>{name}</Text>
    </View>
  )
}
export const SimpleDragAndDrop = () => (
  <Grid>
    <View>
      <DraggableBox name="Glass" />
      <DraggableBox name="Banana" />
      <DraggableBox name="Pear" />
    </View>
    <Dropzone />
  </Grid>
)
