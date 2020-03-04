import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'emotion-theming'
import { Grid, View } from '@databyss-org/ui/primitives'
import styledCss from '@styled-system/css'
import theme, { borderRadius, darkTheme } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { ReactEditor, useSlate } from 'slate-react'
import { Editor, Range } from 'slate'

const Portal = ({ children }) => ReactDOM.createPortal(children, document.body)

const _activeCss = {
  pointerEvents: 'all',
  opacity: 1,
}

const _css = position => ({
  paddingLeft: 'small',
  paddingRight: 'small',
  backgroundColor: 'background.0',
  zIndex: 1,
  pointerEvents: 'none',
  marginTop: pxUnits(-6),
  position: 'absolute',
  opacity: 0,
  transition: `opacity ${theme.timing.quick}ms ease`,
  borderRadius,
  ...position,
})

const _position = { top: -200, left: -200 }

const HoveringToolbar = ({ children }) => {
  const ref = useRef()
  const editor = useSlate()

  useEffect(() => {
    const el = ref.current
    const { selection } = editor

    if (!el) {
      return
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.removeAttribute('style')
      return
    }

    const domSelection = window.getSelection()
    const domRange = domSelection.getRangeAt(0)

    const rect = domRange.getBoundingClientRect()
    el.style.opacity = 1
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
    el.style.left = `${rect.left + window.pageXOffset + rect.width}px`
  })

  return (
    <Portal>
      <ThemeProvider theme={darkTheme}>
        <View
          css={[
            styledCss(_css(_position))(darkTheme),
            styledCss(_activeCss)(darkTheme),
          ]}
          //   {...others}
          ref={ref}
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
