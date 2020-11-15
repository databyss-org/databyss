import React, { useEffect, useState } from 'react'
import { Text, View, List } from '@databyss-org/ui/primitives'
import _ from 'lodash'
import { CatalogSearchLoader } from '@databyss-org/ui/components/Loaders'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { pxUnits } from '@databyss-org/ui/theming/views'
import DropdownListItem from '@databyss-org/ui/components/Menu/DropdownListItem'
import { textToHtml } from '@databyss-org/services/block/serialize'
import { CatalogFooter } from './'

const CatalogResults = ({ menuHeight, type, dismiss, query, selectSource }) => {
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
        <View key={i} mb="em">
          <Text variant="uiTextSmall" color="text.2">
            {author}
          </Text>
          <List verticalItemPadding="tiny">
            {results[author].map((result, k) => (
              <DropdownListItem
                data-test-catalog={type}
                labelHtml={textToHtml(result.title)}
                onPress={() => onPress(result)}
                key={k}
              />
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
      <View overflowX="hidden" overflowY="auto" maxHeight={pxUnits(menuHeight)}>
        {setSource && (
          <CatalogSearchLoader type={type} query={query}>
            {results => {
              setSourcesLoaded(true)
              return _renderResults(results)
            }}
          </CatalogSearchLoader>
        )}
      </View>
      <View
        pt="small"
        borderTopWidth="1px"
        borderColor="border.2"
        borderStyle="solid"
      >
        <CatalogFooter type={type} />
      </View>
    </View>
  )
}

export default CatalogResults
