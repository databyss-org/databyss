import React from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { newPage } from '@databyss-org/services/pages/_helpers'
import { Text, View, BaseControl, Separator } from '@databyss-org/ui/primitives'

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
    <View alignItems="stretch" flexGrow={1} width="100%">
      <Separator color="border.1" />
      <BaseControl width="100%" onClick={onNewPageClick} p="small">
        {/* <Grid singleRow alignItems="center" columnGap="small"> */}
        <Text variant="uiTextNormal" color="text.2">
          New Page
        </Text>
        {/* </Grid> */}
      </BaseControl>
    </View>
  )
}

export default Footer
