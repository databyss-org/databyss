import React, { useRef, useState, useEffect } from 'react'
import styledCss from '@styled-system/css'
import {
  useSourceContext,
  SearchSourceLoader,
} from '@databyss-org/services/sources/SourceProvider'
import theme, { borderRadius, darkTheme } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'
import {
  Button,
  Text,
  View,
  List,
  BaseControl,
} from '@databyss-org/ui/primitives'
import { lineStateToSlate } from './../slate/markup'
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

const splitName = name => ({
  firstName: {
    textValue: name
      .split(' ')
      .slice(0, -1)
      .join(' '),
  },
  lastName: {
    textValue: name
      .split(' ')
      .slice(-1)
      .join(' '),
  },
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

const ComposeResults = ({ results, onClick }) => {
  // const onClick = vol => {
  //   // TODO: COMPOSE DATA
  //   // SET DISPATCHES IN EDITOR AND SOURCE PROVIDER
  //   console.log(vol)
  // }

  return (
    <List verticalItemPadding={1} horizontalItemPadding={1}>
      {Object.keys(results).map((author, i) => {
        return (
          <View key={i}>
            <Text>{author}</Text>
            {results[author].map((volume, k) => {
              return (
                <BaseControl onClick={() => onClick(volume)} key={k}>
                  <View p="tiny">
                    <Text variant="uiTextSmall">{volume.volumeInfo.title}</Text>
                  </View>
                </BaseControl>
              )
            })}
          </View>
        )
      })}
    </List>
  )
}

export const Citations = ({
  editor,
  setBlockType,
  updateAtomic,
  changeContent,
}) => {
  const { setSource } = useSourceContext()

  const menuRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [menuActive, setMenuActive] = useState(false)
  const [sourceQuery, setSourceQuery] = useState(null)

  // set menu active and search query
  useEffect(
    () => {
      if (
        editor.value.anchorBlock &&
        editor.value.anchorBlock.text.charAt(0) === '@'
      ) {
        // TODO: DEBOUNCE SEARCH
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

  const onClick = vol => {
    const text = { textValue: `@${vol.volumeInfo.title}`, ranges: [] }

    const _id = editor.value.anchorBlock.key
    const _refId = editor.value.anchorBlock.data.get('refId')

    // create new slate node
    const _node = lineStateToSlate(text)
    // set node data attributes
    _node.type = 'ENTRY'
    _node.key = _id
    _node.data = { refId: _refId, type: 'ENTRY' }
    // replace node
    editor.replaceNodeByKey(_id, _node)

    // update content in slate
    changeContent(text.textValue, { value: editor.value }, text.ranges)
    // update block to atomic
    setBlockType('SOURCE', _id)
    // set source details in source cache
    setTimeout(() => {
      // compose source data
      const _data = {
        _id: _refId,
        text: { textValue: vol.volumeInfo.title, ranges: [] },
        authors:
          vol.volumeInfo.authors &&
          vol.volumeInfo.authors.map(a => splitName(a)),
      }
      // update in cache
      setSource(_data)

      // replace cursor at end of node
      const _tempNode = editor.value.document.getNode(_id)
      editor.focus()
      editor.moveToEndOfNode(_tempNode)
    }, 20)
  }

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
      <SearchSourceLoader query={sourceQuery}>
        {results => <ComposeResults results={results} onClick={onClick} />}
      </SearchSourceLoader>
    </View>
  )
}

export default Citations
