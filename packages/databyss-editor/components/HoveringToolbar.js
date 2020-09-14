import React, { forwardRef } from 'react'
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
  zIndex: 'menu',
  pointerEvents: showToolbar ? 'all' : 'none',
  marginTop: pxUnits(-6),
  position: 'absolute',
  opacity: showToolbar ? 1 : 0,
  transition: `opacity ${theme.timing.quick}ms ease`,
  borderRadius,
  ...position,
})

const HoveringToolbar = forwardRef(
  ({ children, position, showToolbar }, ref) => (
    <Portal>
      <ThemeProvider theme={darkTheme}>
        <View
          css={[
            styledCss(
              _css(
                {
                  top: position.top,
                  left: position.left,
                  right: position.right,
                  bottom: position.bottom,
                },
                showToolbar
              )
            )(darkTheme),
          ]}
          ref={ref}
        >
          <Grid singleRow columnGap={0} flexWrap="nowrap">
            {children}
          </Grid>
        </View>
      </ThemeProvider>
    </Portal>
  )
)

HoveringToolbar.defaultProps = {
  position: {
    top: -200,
    left: -200,
  },
}

export default HoveringToolbar
