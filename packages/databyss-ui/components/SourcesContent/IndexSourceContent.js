import React from 'react'
import {
  Text,
  View,
  BaseControl,
  Icon,
  Grid,
} from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'

const IndexSourceContent = ({ relations }) => {
  const { getPages } = usePageContext()
  const { navigate } = useNavigationContext()

  const pages = getPages()

  const onPageClick = pageId => {
    navigate(`/pages/${pageId}`)
  }

  const onEntryClick = (pageId, entryId) => {
    navigate(`/pages/${pageId}#${entryId}`)
  }

  const _results = Object.keys(relations.results).map((r, i) => (
    <View key={i} mb="medium">
      <View height="40px">
        <BaseControl
          data-test-element="atomic-results"
          hoverColor="background.2"
          activeColor="background.3"
          key={`pageHeader-${i}`}
          onClick={() => onPageClick(r)}
        >
          <Grid singleRow alignItems="center" columnGap="small">
            <Icon sizeVariant="small" color="text.3">
              <PageSvg />
            </Icon>
            <Text variant="bodyHeading3">{pages[r].name}</Text>
          </Grid>
        </BaseControl>
      </View>

      {relations.results[r].map((e, k) => (
        <BaseControl
          data-test-element="atomic-result-item"
          hoverColor="background.2"
          activeColor="background.3"
          key={k}
          onClick={() => onEntryClick(r, e.blockId)}
        >
          <View p="small" ml="small">
            <Text>{e.blockText.textValue}</Text>
          </View>
        </BaseControl>
      ))}
    </View>
  ))
  return <View>{_results}</View>
}

export default IndexSourceContent
