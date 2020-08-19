import React, { useEffect, useState } from 'react'
import googleLogo from '@databyss-org/ui/assets/powered_by_google_on_white.png'
import googleLogoRetina from '@databyss-org/ui/assets/powered_by_google_on_white_2x.png'
import {
  Text,
  View,
  List,
  BaseControl,
  RawHtml,
} from '@databyss-org/ui/primitives'
import _ from 'lodash'
import { CatalogSearchLoader } from '@databyss-org/ui/components/Loaders'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { textToHtml } from '@databyss-org/services/block/serialize'

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
    textValue: `${_authorText} ${_titleText} (${_yearText})`,
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

const GoogleBooks = ({ menuHeight, dismiss, query, selectSource }) => {
  const [sourcesLoaded, setSourcesLoaded] = useState(false)
  const setSource = useSourceContext(c => c && c.setSource)

  const onClick = vol => {
    const text = _title(vol)

    selectSource({
      text,
      type: 'SOURCE',
      detail: {
        authors:
          vol.volumeInfo.authors &&
          vol.volumeInfo.authors.map(a => splitName(a)),
      },
    })

    dismiss()
  }

  useEffect(() => () => setSourcesLoaded(false), [])

  const _renderResults = results =>
    !_.isEmpty(results) ? (
      Object.keys(results).map((author, i) => (
        <View key={i} mb="tiny">
          <Text variant="uiTextSmall" color="text.2">
            {author}
          </Text>
          <List verticalItemPadding="none">
            {results[author].map((result, k) => (
              <BaseControl
                onPress={() => onClick(result.meta)}
                key={k}
                hoverColor="background.1"
              >
                <Text variant="uiTextSmall" color="text.2">
                  <RawHtml html={textToHtml(result.title)} />
                </Text>
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
          <CatalogSearchLoader type="GOOGLE_BOOKS" query={query}>
            {results => {
              setSourcesLoaded(true)
              return _renderResults(results)
            }}
          </CatalogSearchLoader>
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
