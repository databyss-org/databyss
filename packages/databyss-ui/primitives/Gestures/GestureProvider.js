import React from 'react'
import {
  useDrag as reactDndUseDrag,
  useDrop as reactDndUseDrop,
  DndProvider,
} from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const GestureProvider = ({ children, ...others }) => (
  <DndProvider backend={HTML5Backend} {...others}>
    {children}
  </DndProvider>
)

export const useDrag = reactDndUseDrag
export const useDrop = reactDndUseDrop

export default GestureProvider
