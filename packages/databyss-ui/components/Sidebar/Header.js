import React from 'react'
import ArrowLeft from '@databyss-org/ui/assets/arrowLeft.svg'
import {
  Text,
  View,
  BaseControl,
  Grid,
  Icon,
} from '@databyss-org/ui/primitives'

const headerMap = type => {
  if (type) {
    return { pages: 'Pages', search: 'Search' }[type]
  }
  return 'Databyss'
}

const Header = ({ onHeaderClick, menuItem }) => (
  <BaseControl p={2} width="100%" onClick={() => onHeaderClick()}>
    <View>
      <Grid singleRow alignItems="center" columnGap="small">
        <Icon sizeVariant="medium" color="text.3">
          <ArrowLeft />
        </Icon>
        <Text variant="uiTextLarge" color="text.2">
          {headerMap(menuItem)}
        </Text>
      </Grid>
    </View>
  </BaseControl>
)

export default Header
