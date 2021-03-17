import React from 'react'
import { View, Text, Grid, pxUnits, Button } from '@databyss-org/ui/primitives'
import Login from '@databyss-org/ui/modules/Login/Login'

const Public = (props) => (
  <React.Fragment>
    <Grid
      widthVariant="page"
      backgroundColor="background.1"
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
        childViewProps={{ flexDirection: 'row', alignItems: 'center' }}
        css={{
          textDecoration: 'none',
        }}
      >
        <View mr="small">
          <img
            width={pxUnits(30)}
            src={require('@databyss-org/ui/assets/logo-thick.png')}
            alt="Logo"
          />
        </View>
        <Text variant="uiTextMediumSemibold" color="text.1">
          Databyss
        </Text>
      </Button>
    </Grid>
    <Login {...props} />
  </React.Fragment>
)

export default Public
