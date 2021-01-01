import React from 'react'
import { useDrag } from '@databyss-org/ui/primitives/Gestures/GestureProvider'
import Control from './Control'

const DraggableControl = ({ children, draggable, ...others }) => {
  let draggableItem = { type: 'BaseControl' }
  if (typeof draggable !== 'boolean') {
    draggableItem = { ...draggableItem, ...draggable }
  }
  const [, dragRef] = useDrag({
    item: draggableItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  return (
    <Control ref={dragRef} draggable {...others}>
      {children}
    </Control>
  )
}

export default DraggableControl
