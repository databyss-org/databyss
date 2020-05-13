import React from 'react'
import { View, Text, Grid } from '@databyss-org/ui/primitives'
import Login from '@databyss-org/ui/modules/Login/Login'
import { DatabyssIcon } from '@databyss-org/ui/assets/icons'

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
        <DatabyssIcon
          sizeVariant="medium"
          color="white"
          paddingVariant="small"
          backgroundColor="text.2"
          borderRadius="default"
        />
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
