import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'emotion-theming'
import { Grid, View } from '@databyss-org/ui/primitives'
import styledCss from '@styled-system/css'
import theme, { borderRadius, darkTheme } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { ReactEditor, useSlate } from 'slate-react'
import { Editor, Range } from '@databyss-org/slate'
import { isSelectionAtomic } from './../lib/slateUtils'

const isBackwards = () => {
  const selection = window.getSelection()
  const range = document.createRange()
  range.setStart(selection.anchorNode, selection.anchorOffset)
  range.setEnd(selection.focusNode, selection.focusOffset)

  const backwards = range.collapsed
  range.detach()
  return backwards
}

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
      Editor.string(editor, selection) === '' ||
      isSelectionAtomic(editor)
    ) {
      el.removeAttribute('style')
      return
    }

    // TODO
    // Range.isBackward(selection) does not work

    const _isBackwards = isBackwards()

    const domSelection = window.getSelection()

    const domRange = domSelection.getRangeAt(0)

    // get selected dom nodes
    const _rects = domRange.getClientRects()
    const _length = _rects.length
    const rect = !_isBackwards ? _rects[_length - 1] : _rects[0]

    el.style.opacity = 1
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
    el.style.left = `${rect.left +
      window.pageXOffset +
      (_isBackwards ? 0 : rect.width)}px`
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
