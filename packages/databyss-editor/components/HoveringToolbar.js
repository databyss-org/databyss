import React, { useRef, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'emotion-theming'
import { Grid, View } from '@databyss-org/ui/primitives'
import styledCss from '@styled-system/css'
import theme, { borderRadius, darkTheme } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'

const Portal = ({ children }) => ReactDOM.createPortal(children, document.body)

const _css = (position, showToolbar) => ({
  paddingLeft: 'small',
  paddingRight: 'small',
  backgroundColor: 'background.0',
  zIndex: 'hoveringToolbar',
  pointerEvents: showToolbar ? 'all' : 'none',
  marginTop: pxUnits(-6),
  position: 'absolute',
  opacity: showToolbar ? 1 : 0,
  transition: `opacity ${theme.timing.quick}ms ease`,
  borderRadius,
  left: pxUnits(position.left),
  top: pxUnits(position.top),
})

const HoveringToolbar = ({ children, selectionRect, selectionIsBackwards }) => {
  const offscreenPosition = { top: -200, left: -200 }
  const menuRef = useRef()
  const [position, setPosition] = useState(offscreenPosition)

  const updatePosition = () => {
    if (!selectionRect) {
      return
    }
    const el = menuRef.current
    setPosition({
      top: selectionRect.top + window.pageYOffset - el.offsetHeight,
      left:
        selectionRect.left + (selectionIsBackwards ? 0 : selectionRect.width),
    })
  }

  useEffect(() => {
    if (menuRef.current) {
      updatePosition()
    } else {
      setPosition(offscreenPosition)
    }
  }, [menuRef.current, selectionRect, selectionIsBackwards])

  return (
    <Portal>
      <ThemeProvider theme={darkTheme}>
        <View
          css={[
            styledCss(_css(position, position.top > 0 && position.left > 0))(
              darkTheme
            ),
          ]}
          ref={menuRef}
        >
          <Grid singleRow columnGap={0} flexWrap="nowrap">
            {children}
          </Grid>
        </View>
      </ThemeProvider>
    </Portal>
  )
}

export default HoveringToolbar
