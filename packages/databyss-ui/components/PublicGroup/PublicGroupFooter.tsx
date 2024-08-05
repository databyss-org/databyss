import React, { useCallback } from 'react'
import DatabyssImg from '@databyss-org/ui/assets/logo-thick.png'
import { Group } from '@databyss-org/services/interfaces'
import { Text, View, Icon, BaseControl } from '../..'
import { pxUnits } from '../../theming/views'

export const PublicGroupFooter = ({ group, ...others }: { group: Group }) => (
  <View
    flexDirection="row"
    bg="background.1"
    px="medium"
    py="small"
    borderTopColor="border.2"
    borderTopWidth={pxUnits(1)}
    borderTopStyle="solid"
    alignItems="center"
    justifyContent="flex-end"
    {...others}
  >
    <View flexDirection="row" alignItems="center">
      <Text variant="uiTextSmall" color="text.2">
        Powered by Databyss
      </Text>
    </View>
  </View>
)
