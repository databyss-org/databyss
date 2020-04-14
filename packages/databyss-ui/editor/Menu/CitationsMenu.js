import React, { useRef, useState, useEffect } from 'react'
import styledCss from '@styled-system/css'
import _ from 'lodash'
import ClickAwayListener from '@databyss-org/ui/components/Util/ClickAwayListener'
import {
  useSourceContext,
  SearchSourceLoader,
} from '@databyss-org/services/sources/SourceProvider'
import google from '@databyss-org/ui/assets/google.png'
import useEventListener from '@databyss-org/ui/lib/useEventListener'
import theme, { borderRadius } from '@databyss-org/ui/theming/theme'
import { pxUnits } from '@databyss-org/ui/theming/views'
import {
  Grid,
  Text,
  View,
  List,
  BaseControl,
} from '@databyss-org/ui/primitives'
import { lineStateToSlate } from './../slate/markup'

const MENU_HEIGHT = 200

const _css = (position, active) => ({
  paddingLeft: 'small',
  paddingRight: 'small',
  backgroundColor: 'background.0',
  zIndex: 1,
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

  if (editor.value.anchorBlock) {
    const _path = [editor.value.selection.start.path.get(0), 0]

    // eslint-disable-next-line
    const _node = editor.findDOMNode(_path)

    if (_node) {
      const _rect = _node.getBoundingClientRect()
      const _windowHeight = window.innerHeight

      // check if menu should be above text
      const _menuTop = _windowHeight < _rect.bottom + MENU_HEIGHT

      // set dropdown position
      const left = _rect.left + 12
      const top = _menuTop ? _rect.top - 36 : _rect.bottom + 12

      const _position = { top, left, displayAbove: _menuTop }
      return _position
    }
    return null
  }
  return null
}

/* composes title from google api data */
const _title = vol => {
  const _author = vol.volumeInfo.authors && splitName(vol.volumeInfo.authors[0])

  const _authorText = _author
    ? _author.lastName.textValue +
      (_author.firstName.textValue ? ',' : '.') +
      (_author.firstName.textValue ? `${_author.firstName.textValue}.` : '')
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

const GoogleFooter = () => (
  <div>
    <img src={google} alt="powered by Google" />
  </div>
)

const ComposeResults = ({ results, onClick, unmount }) => {
  useEffect(() => () => unmount(), [])
  return !_.isEmpty(results) ? (
    <List verticalItemPadding={1} horizontalItemPadding={1}>
      {Object.keys(results).map((author, i) => (
        <View key={i}>
          <Text variant="uiTextSmall" color="text.2">
            {author}
          </Text>
          <List verticalItemPadding="tiny">
            {results[author].map((volume, k) => (
              <BaseControl onClick={() => onClick(volume)} key={k}>
                <View p="tiny" pr="tiny">
                  <Grid columnGap="none">
                    <Text variant="uiTextSmall" color="text.2">
                      <i>{volume.volumeInfo.title}</i>
                      {volume.volumeInfo.subtitle &&
                        `: ${volume.volumeInfo.subtitle}`}&emsp;({volume
                        .volumeInfo.publishedDate &&
                        volume.volumeInfo.publishedDate.substring(0, 4)})
                    </Text>
                  </Grid>
                </View>
              </BaseControl>
            ))}
          </List>
        </View>
      ))}
    </List>
  ) : (
    <Text variant="uiTextSmall">no results found</Text>
  )
}

export const Citations = ({ editor, setBlockType, changeContent }) => {
  const { setSource } = useSourceContext()

  const menuRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [menuActive, setMenuActive] = useState(false)
  const [sourcesLoaded, setSourcesLoaded] = useState(false)
  const [sourceQuery, setSourceQuery] = useState(null)

  useEventListener('keydown', e => {
    if (e.key === 'Escape') {
      setMenuActive(false)
    }
  })

  // prevents scroll if modal is visible
  useEventListener('wheel', e => menuActive && e.preventDefault(), editor.el)

  // set menu active and search query
  useEffect(
    () => {
      if (
        editor.value.anchorBlock &&
        editor.value.anchorBlock.text.charAt(0) === '@' &&
        editor.value.selection.isFocused
      ) {
        setSourceQuery(editor.value.anchorBlock.text.substring(1))
        return setMenuActive(true)
      }
      return setMenuActive(false)
    },
    [editor.value.anchorBlock]
  )

  // set position of dropdown
  useEffect(
    () => {
      if (menuActive) {
        const _position = getPosition(editor, menuRef)
        // if cursor is near window bottom set menu above cursor
        if (_position) {
          if (_position.displayAbove && sourcesLoaded) {
            _position.top -= MENU_HEIGHT + 22
          }
          setPosition(_position)
        }
      }
    },
    [editor.value.selection, menuActive, sourcesLoaded]
  )

  const onClick = vol => {
    const text = _title(vol)

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
    }, 500)

    setTimeout(() => {
      // replace cursor at end of node
      const _tempNode = editor.value.document.getNode(_id)
      editor.focus()
      editor.moveToEndOfNode(_tempNode)
    }, 20)
  }

  const onClickAway = () => {
    if (menuActive) {
      setMenuActive(false)
    }
  }

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <View
        maxWidth="500px"
        minWidth="300px"
        minHeight="32px"
        shadowVariant="modal"
        ref={menuRef}
        css={styledCss(
          _css({ top: position.top, left: position.left }, menuActive)
        )}
      >
        {sourceQuery ? (
          <View p={sourcesLoaded && 'small'}>
            <View
              overflowX="hidden"
              overflowY="scroll"
              maxHeight={pxUnits(MENU_HEIGHT)}
            >
              <SearchSourceLoader query={sourceQuery}>
                {results => {
                  setSourcesLoaded(true)
                  return (
                    <ComposeResults
                      results={results}
                      onClick={onClick}
                      unmount={() => setSourcesLoaded(false)}
                    />
                  )
                }}
              </SearchSourceLoader>
            </View>

            {sourcesLoaded && (
              <View
                p="small"
                borderTopWidth="1px"
                borderColor="border.2"
                borderStyle="solid"
              >
                <GoogleFooter />{' '}
              </View>
            )}
          </View>
        ) : (
          <View p="small">
            <Text variant="uiTextSmall" color="text.2">
              type title and/or author for suggestions...
            </Text>
          </View>
        )}
      </View>
    </ClickAwayListener>
  )
}

export default Citations
