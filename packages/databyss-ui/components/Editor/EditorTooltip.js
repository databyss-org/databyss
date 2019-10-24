import React, { useRef, useState, useEffect } from 'react'
import { pxUnits } from '@databyss-org/ui/theming/views'
import styledCss from '@styled-system/css'
import { Grid, View } from '@databyss-org/ui/primitives'
import theme, { borderRadius, darkTheme } from '@databyss-org/ui/theming/theme'
import { ThemeProvider } from 'emotion-theming'
import space from '@databyss-org/ui/theming/space'
import { isMobileOs } from '@databyss-org/ui/'
import { isAtomicInlineType } from './slate/reducer'

const _mobile = isMobileOs()

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

const getPosition = (editor, menuRef) => {
  const menu = menuRef.current
  if (!menu) return null
  const native = window.getSelection()
  const range = native.getRangeAt(0)
  const rect = range.getBoundingClientRect()
  // eslint-disable-next-line
  const _node = editor.findDOMNode(
    editor.value.document.getPath(editor.value.selection.focus.key)
  )
  const isMobileNewLine = rect.width === 0
  const _mobileOffsetHeight = isMobileNewLine
    ? `${rect.bottom + _node.getBoundingClientRect().top + 32}px`
    : `${rect.bottom + window.pageYOffset + 10}px`
  // menu offset to prevent overflow
  let menuLeftOffset = 0

  if (menu.offsetWidth / 2 > rect.left + rect.width / 2) {
    menuLeftOffset =
      menu.offsetWidth / 2 - (rect.left + rect.width / 2) + space.small
  }

  if (rect.left + rect.width / 2 + menu.offsetWidth / 2 > window.innerWidth) {
    menuLeftOffset =
      window.innerWidth -
      (rect.left + rect.width / 2 + menu.offsetWidth / 2) -
      space.small
  }

  return {
    top: _mobile
      ? _mobileOffsetHeight
      : pxUnits(rect.top + window.pageYOffset - menu.offsetHeight),
    left: pxUnits(
      rect.left +
        window.pageXOffset -
        menu.offsetWidth / 2 +
        rect.width / 2 +
        menuLeftOffset
    ),
  }
}

const _activeCss = {
  pointerEvents: 'all',
  opacity: 1,
}

export const isAtomicNotInSelection = value => {
  const { fragment } = value

  // BUG: if whole block is selected by double click, it includes the next block
  const isNotAtomicInFragment =
    fragment.nodes.filter(block => isAtomicInlineType(block.type)).size === 0

  return isNotAtomicInFragment
}

const isActiveSelection = (value, editorState) => {
  const { fragment, selection } = value

  // returns a boolean if both anchor and focus do not contain atomic block
  const isNotAtomic = isAtomicNotInSelection(value, editorState)

  if (
    selection.isBlurred ||
    selection.isCollapsed ||
    fragment.text === '' ||
    !isNotAtomic
  ) {
    return false
  }
  return true
}

const isNewLine = value => {
  console.log('isNewLineOnMobile', value.focusBlock.text.length)
  return value.anchorBlock && value.anchorBlock.text.length === 0
}

const EditorTooltip = ({ children, css, editor, editorState, ...others }) => {
  const menuRef = useRef(null)
  const [active, setActive] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const { value } = editor
  useEffect(
    () => {
      if (
        isActiveSelection(value, editorState) ||
        (_mobile && isNewLine(value))
      ) {
        setPosition(getPosition(editor, menuRef))
        setActive(true)
      } else {
        setActive(false)
      }
    },
    [value]
  )

  return (
    <ThemeProvider theme={darkTheme}>
      <View
        css={[
          styledCss(_css(position))(darkTheme),
          active && styledCss(_activeCss)(darkTheme),
          css,
        ]}
        {...others}
        ref={menuRef}
      >
        <Grid singleRow columnGap={0} flexWrap="nowrap">
          {children}
        </Grid>
      </View>
    </ThemeProvider>
  )
}

export default EditorTooltip
