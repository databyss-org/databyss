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

export const isSelectionReversed = value => {
  const { selection, fragment, document } = value

  if (
    !selection.focus.isInNode(
      document.getNode(fragment.nodes.get(fragment.nodes.size - 1).key)
    )
  ) {
    return true
  }
  return false
}

export const getSelectedBlocks = value => {
  // const value = editor.value
  const { selection, fragment, document } = value
  let _fragmentNodes = fragment.nodes
  // get normalized block list
  let _nodeList = document.getRootBlocksAtRange(selection)
  // if fragment selection spans multiple block
  if (_nodeList.size > 1) {
    // reverse if needed
    if (isSelectionReversed(value)) {
      _fragmentNodes = _fragmentNodes.reverse()
      _nodeList = _nodeList.reverse()
    }

    const _lastNodeFragment = _fragmentNodes.get(_fragmentNodes.size - 1).text
    const _lastNode = _nodeList.get(_nodeList.size - 1)

    const _firstNodeFragment = _fragmentNodes.get(0).text
    const _firstNode = _nodeList.get(0)

    // if first block selection is not equal to first block
    // remove block from list
    if (_firstNode.text !== _firstNodeFragment) {
      _nodeList = _nodeList.delete(0)
    }

    // if last block selection is not equal to last block
    // remove block from list
    if (_lastNode.text !== _lastNodeFragment) {
      _nodeList = _nodeList.delete(_nodeList.size - 1)
    }

    // check if reversed
    if (isSelectionReversed(value)) {
      _nodeList = _nodeList.reverse()
    }

    return _nodeList
  }
  return _nodeList
}

export const isAtomicNotInSelection = value => {
  const _nodeList = getSelectedBlocks(value)

  const isNotAtomicInFragment =
    _nodeList.filter(block => isAtomicInlineType(block.type)).size === 0

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

const isNewLine = value =>
  value.anchorBlock && value.anchorBlock.text.length === 0

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
