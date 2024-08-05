import React, {
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ThemeContext } from '@emotion/core'
import css from '@styled-system/css'
import { View, ViewProps } from '../..'
import { useContextMenu } from '../../components/Menu/ContextMenuProvider'

export interface ResizableColumnViewProps extends ViewProps {
  children?: ReactNode
  onResized?: (width: number) => void
  width: number
  minWidth?: number
}

export const ResizableColumnView = forwardRef<
  HTMLElement,
  ResizableColumnViewProps
>(({ children, width, onResized, minWidth, ...others }, ref) => {
  const viewRef = useRef<HTMLElement | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [viewWidth, setViewWidth] = useState<number>(width)
  const { isMenuVisible } = useContextMenu()

  const startResizing = useCallback(() => {
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    if (isResizing && onResized) {
      onResized(viewWidth)
    }
    setIsResizing(false)
  }, [viewWidth])

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const _width =
          mouseMoveEvent.clientX - viewRef.current!.getBoundingClientRect().left
        if (typeof minWidth === 'undefined' || _width > minWidth) {
          setViewWidth(_width)
        }
      }
    },
    [isResizing]
  )

  useEffect(() => {
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResizing)
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [resize, stopResizing])

  return (
    <ThemeContext.Consumer>
      {(theme: any) => (
        <>
          <View flexDirection="row" ref={viewRef} position="relative">
            <View {...others} ref={ref} width={viewWidth}>
              {children}
            </View>
            {!isMenuVisible && (
              <View
                width="4px"
                position="absolute"
                top={0}
                bottom={0}
                right="-3px"
                zIndex={theme.zIndex.menu + 1}
                css={{
                  cursor: 'col-resize',
                  '&:hover': {
                    background: css({ color: 'purple.1' })(theme).color,
                  },
                  userSelect: 'none',
                }}
                onMouseDown={startResizing}
              />
            )}
          </View>
          {isResizing && (
            <View
              position="absolute"
              top="0"
              bottom="0"
              left="0"
              right="0"
              zIndex={theme.zIndex.menu}
              opacity={0}
              onMouseDown={(e) => e.preventDefault()}
            />
          )}
        </>
      )}
    </ThemeContext.Consumer>
  )
})
