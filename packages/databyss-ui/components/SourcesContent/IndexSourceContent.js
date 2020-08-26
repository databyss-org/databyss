import React from 'react'
import {
  Text,
  View,
  BaseControl,
  Icon,
  Grid,
  RawHtml,
} from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { slateBlockToHtmlWithSearch } from '@databyss-org/editor/lib/util'

const IndexSourceContent = ({ relations }) => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const { getPages } = usePageContext()
  const { navigate } = useNavigationContext()

  const pages = getPages()

  const onPageClick = pageId => {
    navigate(`/${account._id}/pages/${pageId}`)
  }

  const onEntryClick = (pageId, entryId) => {
    navigate(`/${account._id}/pages/${pageId}#${entryId}`)
  }

  const _results = Object.keys(relations.results)
    // filter out results not associated to a page
    // page may have been archived
    .filter(r => pages[r]?.name)
    // filter out results if no entries are included
    .filter(r => relations.results[r].length)
    .map((r, i) => (
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

        {relations.results[r]
          .filter(e => e.blockText.textValue.length)
          .map((e, k) => (
            <BaseControl
              data-test-element="atomic-result-item"
              hoverColor="background.2"
              activeColor="background.3"
              key={k}
              onClick={() => onEntryClick(r, e.blockId)}
            >
              <View p="small" ml="small">
                <Text>
                  <RawHtml
                    html={slateBlockToHtmlWithSearch({
                      text: e.blockText,
                      type: 'ENTRY',
                    })}
                  />
                </Text>
              </View>
            </BaseControl>
          ))}
      </View>
    ))
  return <View>{_results}</View>
}

export default IndexSourceContent
