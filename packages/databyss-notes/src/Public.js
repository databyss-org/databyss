import React from 'react'
import { View, Text, Grid, pxUnits, Button } from '@databyss-org/ui/primitives'
import Login from '@databyss-org/ui/modules/Login/Login'

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
      <Button
        variant="uiTextButton"
        href="https://www.databyss.org/"
        childViewProps={{ flexDirection: 'row' }}
        css={{
          textDecoration: 'none',
        }}
      >
        <View mr="small">
          <img width={pxUnits(26)} src="/homepage/logo_new.png" alt="Logo" />
        </View>
        {/* <View flexGrow={0}> */}
        <Text variant="uiTextMediumSemibold" color="text.1">
          Databyss
        </Text>
        {/* </View> */}
      </Button>
    </Grid>
    <Login {...props} />
  </React.Fragment>
)

export default Public
