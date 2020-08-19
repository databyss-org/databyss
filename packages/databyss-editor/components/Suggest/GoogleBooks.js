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

  const onPress = result => {
    selectSource({ ...result.source })
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
                onPress={() => onPress(result)}
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
