import React from 'react'
import {
  View,
  Text,
  Grid,
  useDrop,
  BaseControl,
} from '@databyss-org/ui/primitives'

// follows react-dnd "simple" example, but using draggable BaseControls

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

const DraggableBox = ({ name }: { name: string }) => (
  <BaseControl draggable>
    <View
      borderVariant="thinLight"
      paddingVariant="small"
      m="small"
      bg="background.0"
    >
      <Text>{name}</Text>
    </View>
  </BaseControl>
)
export const DragAndDropWithControls = () => (
  <Grid>
    <View>
      <DraggableBox name="Glass" />
      <DraggableBox name="Banana" />
      <DraggableBox name="Pear" />
    </View>
    <Dropzone />
  </Grid>
)
