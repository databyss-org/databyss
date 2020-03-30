import React from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { newPage } from '@databyss-org/services/pages/_helpers'
import {
  Text,
  View,
  BaseControl,
  Grid,
  Icon,
  Separator,
} from '@databyss-org/ui/primitives'
import Plus from '@databyss-org/ui/assets/plus.svg'

const FooterText = ({ text }) => (
  <Text color="text.3" variant="uiTextSmall" p="tiny">
    {text}
  </Text>
)

const Footer = () => {
  const { navigate, navigateSidebar } = useNavigationContext()
  const { setPage } = usePageContext()
  const onNewPageClick = () => {
    const _page = newPage()
    setPage(_page)
    navigate(`/pages/${_page.page._id}`)
    navigateSidebar('/pages')
  }

  return (
    <View alignItems="stretch" flexGrow={1} width="100%" p="medium">
      <Separator color="border.1" />

      <View p="small">
        <FooterText text="Syntax Guide" />
      </View>
      <Separator color="border.1" />
      <View p="small">
        <FooterText text="@ source" />
        <FooterText text="// location" />
        <FooterText text="# topic" />
      </View>
      <Separator color="border.1" />
      <BaseControl width="100%" onClick={onNewPageClick}>
        <View p="medium" pl="small">
          <Grid singleRow alignItems="center" columnGap="small">
            <Icon sizeVariant="medium" color="text.3">
              <Plus />
            </Icon>
            <Text variant="uiTextSmall" color="text.3">
              New Page
            </Text>
          </Grid>
        </View>
      </BaseControl>
    </View>
  )
}

export default Footer
