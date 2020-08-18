import React, { useEffect, useState } from 'react'
import { ReactEditor } from '@databyss-org/slate-react'
import { Transforms } from '@databyss-org/slate'
import googleLogo from '@databyss-org/ui/assets/powered_by_google_on_white.png'
import googleLogoRetina from '@databyss-org/ui/assets/powered_by_google_on_white_2x.png'
import {
  Grid,
  Text,
  View,
  List,
  BaseControl,
} from '@databyss-org/ui/primitives'
import _ from 'lodash'
import { SearchSourceLoader } from '@databyss-org/ui/components/Loaders'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { stateSelectionToSlateSelection } from '../../lib/slateUtils'

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

/* composes title from google api data */
const _title = vol => {
  const _author = vol.volumeInfo.authors && splitName(vol.volumeInfo.authors[0])

  const _authorText = _author
    ? _author.lastName.textValue +
      (_author.firstName.textValue ? ', ' : '.') +
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
  <img
    srcSet={`${googleLogo}, ${googleLogoRetina} 2x`}
    src={googleLogo}
    alt="powered by Google"
    width="112"
    height="14"
  />
)

const GoogleBooks = ({ editorContext, editor, menuHeight, dismiss, query }) => {
  const [sourcesLoaded, setSourcesLoaded] = useState(false)
  const setSource = useSourceContext(c => c && c.setSource)

  const onClick = (e, vol) => {
    const index = editorContext.state.selection.anchor.index
    const entity = editorContext.state.blocks[index]

    const text = _title(vol)
    const offset = text.textValue.length

    const { setContent } = editorContext

    const selection = {
      anchor: { index, offset },
      focus: { index, offset },
    }

    setContent({
      // force reducer block blur to set atomic
      selection,
      operations: [
        {
          index,
          text,
          withBakeAtomic: true,
        },
      ],
    })

    ReactEditor.focus(editor)
    window.requestAnimationFrame(() => {
      // set selection at end of new atomic block
      const _slateSelection = stateSelectionToSlateSelection(
        editor.children,
        selection
      )
      Transforms.select(editor, _slateSelection)

      // compose source data
      const _data = {
        _id: entity._id,
        text: { textValue: text.textValue.substring(1), ranges: text.ranges },
        detail: {
          authors:
            vol.volumeInfo.authors &&
            vol.volumeInfo.authors.map(a => splitName(a)),
        },
      }
      // update in cache
      setSource(_data)
    })

    dismiss()
  }

  useEffect(() => () => setSourcesLoaded(false), [])

  const _renderResults = results =>
    !_.isEmpty(results) ? (
      Object.keys(results).map((author, i) => (
        <View key={i}>
          <Text variant="uiTextSmall" color="text.2">
            {author}
          </Text>
          <List verticalItemPadding="tiny">
            {results[author].map((volume, k) => (
              <BaseControl
                onClick={e => onClick(e, volume)}
                key={k}
                hoverColor="background.1"
              >
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
      ))
    ) : (
      <View py="small">
        <Text variant="uiTextSmall">No results found</Text>
      </View>
    )

  return (
    <View p={sourcesLoaded && 'small'}>
      <View
        overflowX="hidden"
        overflowY="scroll"
        maxHeight={pxUnits(menuHeight)}
      >
        {setSource && (
          <SearchSourceLoader query={query}>
            {results => {
              setSourcesLoaded(true)
              return _renderResults(results)
            }}
          </SearchSourceLoader>
        )}
      </View>
      <View
        py="small"
        borderTopWidth="1px"
        borderColor="border.2"
        borderStyle="solid"
      >
        <GoogleFooter />
      </View>
    </View>
  )
}

export default GoogleBooks
