import React, { useRef, useState, useEffect } from 'react'
import styledCss from '@styled-system/css'
import {
  useSourceContext,
  SearchSourceLoader,
} from '@databyss-org/services/sources/SourceProvider'
import google from '@databyss-org/ui/assets/google.png'

import theme, { borderRadius, darkTheme } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'
import {
  Button,
  Grid,
  Text,
  View,
  List,
  BaseControl,
} from '@databyss-org/ui/primitives'
import { lineStateToSlate } from './../slate/markup'
import { isMobileOs } from '@databyss-org/ui/'

// import { getPosition } from './../EditorTooltip'

const _mobile = isMobileOs()

const GoogleFooter = () => (
  <div>
    <img src={google} alt="powered by Google" />
  </div>
)

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
  return (
    <List verticalItemPadding={1} horizontalItemPadding={1}>
      {Object.keys(results).map((author, i) => {
        return (
          <View key={i}>
            <Text variant="uiTextSmall" color="text.2">
              {author}
            </Text>
            <List verticalItemPadding={'tiny'}>
              {results[author].map((volume, k) => {
                return (
                  <BaseControl onClick={() => onClick(volume)} key={k}>
                    <View p="tiny" pr="tiny">
                      <Grid columnGap="none">
                        <Text variant="uiTextSmallItalic" color="text.2">
                          {volume.volumeInfo.title}&emsp;
                        </Text>
                        <Text variant="uiTextSmall" color="text.2">
                          ({volume.volumeInfo.publishedDate &&
                            volume.volumeInfo.publishedDate.substring(0, 4)})
                        </Text>
                      </Grid>
                    </View>
                  </BaseControl>
                )
              })}
            </List>
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
        editor.value.anchorBlock.text.charAt(0) === '@' &&
        editor.value.selection.isFocused
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
    /* composes title from google api data*/
    const _title = () => {
      const _author =
        vol.volumeInfo.authors && splitName(vol.volumeInfo.authors[0])
      const _authorText = _author
        ? `${_author.lastName.textValue}, ${_author.firstName.textValue}.`
        : ''
      const _titleText = vol.volumeInfo.title

      const _yearText = vol.volumeInfo.publishedDate
        ? vol.volumeInfo.publishedDate.substring(0, 4)
        : ''

      const _ranges = [
        {
          length: _titleText.length,
          offset: _authorText ? _authorText.length + 1 : 0,
          marks: ['italic'],
        },
      ]

      return {
        textValue: `@${_authorText} ${_titleText} (${_yearText})`,
        ranges: _ranges,
      }
    }

    const text = _title()

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
        text: { textValue: text.textValue.substring(1), ranges: text.ranges },
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
      maxWidth="500px"
      minWidth="300px"
      minHeight="32px"
      ref={menuRef}
      css={styledCss(_css(position, menuActive))}
    >
      {sourceQuery ? (
        <View>
          <View overflowX="hidden" overflowY="scroll" maxHeight="200px">
            <SearchSourceLoader query={sourceQuery}>
              {results => (
                <ComposeResults results={results} onClick={onClick} />
              )}
            </SearchSourceLoader>
          </View>
          <View
            p="small"
            borderTopWidth="1px"
            borderColor="border.2"
            borderStyle="solid"
          >
            <GoogleFooter />
          </View>
        </View>
      ) : (
        <View p="small">
          <Text variant="uiTextSmall" color="text.2">
            type title and/or author for suggestions...
          </Text>
        </View>
      )}
    </View>
  )
}

export default Citations
