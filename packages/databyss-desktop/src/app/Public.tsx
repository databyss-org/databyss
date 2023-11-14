import React from 'react'
import { Viewport } from '@databyss-org/ui'
import MobileWarning from '@databyss-org/ui/components/Notify/MobileWarning'
import { View, Text, Grid, Button } from '@databyss-org/ui/primitives'
import { Maintenance, Login } from '@databyss-org/ui/modules'
import { pxUnits } from '@databyss-org/ui/theming/views'

export const Public = (props) => {
  const _public = (
    <View flexGrow={1} width="100%" alignItems="center">
      <Grid
        widthVariant="page"
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
      {process.env.MAINTENANCE_MODE?.toLowerCase() === 'true' ? (
        <Maintenance />
      ) : (
        <Login {...props} />
      )}
    </View>
  )
  return process.env.FORCE_MOBILE ? (
    <>
      <MobileWarning />
      <Viewport p={0}> {_public}</Viewport>
    </>
  ) : (
    _public
  )
}
