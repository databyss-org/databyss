import React from 'react'
import { View, Icon, Text, Grid } from '@databyss-org/ui/primitives'
import Login from '@databyss-org/ui/modules/Login/Login'
import LogoSvg from '@databyss-org/ui/assets/databyss.svg'

const Public = props => (
  <React.Fragment>
    <Grid
      widthVariant="page"
      position="fixed"
      width="100%"
      top="0"
      paddingVariant="medium"
      columnGap="small"
      alignItems="center"
      singleRow
    >
      <View flexGrow={0}>
        <Icon
          sizeVariant="medium"
          color="white"
          paddingVariant="small"
          backgroundColor="text.2"
          borderRadius="default"
        >
          <LogoSvg />
        </Icon>
      </View>
      <View flexGrow={0}>
        <Text variant="uiTextNormalSemibold" color="text.1">
          Databyss
        </Text>
      </View>
    </Grid>
    <Login {...props} />
  </React.Fragment>
)

export default Public
