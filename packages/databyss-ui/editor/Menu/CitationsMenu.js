import React, { useRef, useState, useEffect } from 'react'
import styledCss from '@styled-system/css'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import theme, { borderRadius, darkTheme } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'
import {
  Button,
  Text,
  View,
  List,
  BaseControl,
} from '@databyss-org/ui/primitives'
import { isMobileOs } from '@databyss-org/ui/'

// import { getPosition } from './../EditorTooltip'

const _mobile = isMobileOs()

const _css = (position, active) => ({
  paddingLeft: 'small',
  paddingRight: 'small',
  backgroundColor: 'background.0',
  zIndex: 1,
  pointerEvents: 'none',
  marginTop: pxUnits(-6),
  position: 'absolute',
  opacity: active ? 1 : 0,
  transition: `opacity ${theme.timing.quick}ms ease`,
  borderRadius,
  pointerEvents: active ? 'all' : 'none',
  ...position,
})

export const getPosition = (editor, menuRef) => {
  const menu = menuRef.current
  if (!menu) return null
  // const native = window.getSelection()
  // const range = native.getRangeAt(0)
  //  const rect = range.getBoundingClientRect()

  // let menuTopOffset = 0
  //   if (rect.top < menu.offsetHeight) {
  //     menuTopOffset = 62
  //   }

  if (editor.value.anchorBlock) {
    const _path = [editor.value.selection.start.path.get(0), 0]

    // // eslint-disable-next-line
    const _node = editor.findDOMNode(_path)

    if (_node) {
      const _rect = _node.getBoundingClientRect()

      // set dropdown position
      const left = _rect.left + 12
      const top = _rect.bottom + 12

      const _position = { top, left }
      return _position
    }
    return null
  }
  return null

  //   const isMobileNewLine = rect.width === 0
  //   const _mobileOffsetHeight = isMobileNewLine
  //     ? `${_node.getBoundingClientRect().top + 32}px`
  //     : `${rect.bottom + window.pageYOffset + 10 + menuTopOffset}px`
  //   // menu offset to prevent overflow
  //   let menuLeftOffset = 0

  //   if (menu.offsetWidth / 2 > rect.left + rect.width / 2) {
  //     menuLeftOffset =
  //       menu.offsetWidth / 2 - (rect.left + rect.width / 2) + space.small
  //   }

  //   if (rect.left + rect.width / 2 + menu.offsetWidth / 2 > window.innerWidth) {
  //     menuLeftOffset =
  //       window.innerWidth -
  //       (rect.left + rect.width / 2 + menu.offsetWidth / 2) -
  //       space.small
  //   }

  //   return {
  //     top: _mobile
  //       ? _mobileOffsetHeight
  //       : pxUnits(
  //           rect.top + window.pageYOffset - menu.offsetHeight + menuTopOffset
  //         ),
  //     left: pxUnits(
  //       rect.left +
  //         window.pageXOffset -
  //         menu.offsetWidth / 2 +
  //         rect.width / 2 +
  //         menuLeftOffset
  //     ),
  //   }
}

export const Citations = ({ editor }) => {
  const { searchSource } = useSourceContext()
  const [didstuff, setdidstuff] = useState(false)
  const menuRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [menuActive, setMenuActive] = useState(false)
  const [sourceQuery, setSourceQuery] = useState(null)

  useEffect(
    () => {
      searchSource(sourceQuery)
    },
    [sourceQuery]
  )

  // set menu active and search query
  useEffect(
    () => {
      if (
        editor.value.anchorBlock &&
        editor.value.anchorBlock.text.charAt(0) === '@'
      ) {
        setSourceQuery(editor.value.anchorBlock.text.substring(1))
        return setMenuActive(true)
      }
      setMenuActive(false)
    },
    [editor.value.anchorBlock]
  )

  // set position of dropdown
  useEffect(
    () => {
      if (menuActive) {
        const _position = getPosition(editor, menuRef)
        if (_position) {
          setPosition(_position)
        }
      }
    },
    [editor.value.selection, menuActive]
  )

  return (
    <View
      overflowX="hidden"
      overflowY="scroll"
      maxWidth="500px"
      minWidth="300px"
      maxHeight="200px"
      ref={menuRef}
      css={styledCss(_css(position, menuActive))}
    >
      <List verticalItemPadding={1} horizontalItemPadding={1}>
        <BaseControl>
          <View p="tiny">
            <Text variant="uiTextSmall">author item</Text>
          </View>
        </BaseControl>
        <BaseControl>
          <View p="tiny">
            <Text variant="uiTextSmall">author item</Text>
          </View>
        </BaseControl>
        <BaseControl>
          <View p="tiny">
            <Text variant="uiTextSmall">author item</Text>
          </View>
        </BaseControl>
        <BaseControl>
          <View p="tiny">
            <Text variant="uiTextSmall">author item</Text>
          </View>
        </BaseControl>
        <BaseControl>
          <View p="tiny">
            <Text variant="uiTextSmall">author item</Text>
          </View>
        </BaseControl>
      </List>
    </View>
  )
}

export default Citations
