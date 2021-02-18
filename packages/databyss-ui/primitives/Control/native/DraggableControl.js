import React, { forwardRef } from 'react'
import { useDrag } from '@databyss-org/ui/primitives/Gestures/GestureProvider'
import Control from './Control'
import forkRef from '../../../lib/forkRef'

const DraggableControl = forwardRef(
  ({ children, draggable, ...others }, ref) => {
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
      <Control ref={forkRef(dragRef, ref)} draggable {...others}>
        {children}
      </Control>
    )
  }
)

export default DraggableControl
