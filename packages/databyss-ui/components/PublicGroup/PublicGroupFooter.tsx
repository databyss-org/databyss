import React, { useCallback } from 'react'
import DatabyssImg from '@databyss-org/ui/assets/logo-thick.png'
import { Group } from '@databyss-org/services/interfaces'
import { Text, View, Button } from '../..'
import { pxUnits } from '../../theming/views'
import { version } from '@databyss-org/services'

export const PublicGroupFooter = ({ group, ...others }: { group: Group }) => (
  <View
    flexDirection="row"
    bg="background.1"
    p="none"
    borderTopColor="border.2"
    borderTopWidth={pxUnits(1)}
    borderTopStyle="solid"
    alignItems="center"
    justifyContent="flex-end"
    {...others}
  >
    {group && (
      <View
        flexDirection="row"
        alignItems="center"
        borderLeftColor="border.2"
        borderLeftStyle="solid"
        borderLeftWidth={1}
        py="tiny"
        px="small"
      >
        <Text variant="uiTextSmall" color="text.2">
          Last updated: {new Date(group.lastPublishedAt!).toLocaleString()}
        </Text>
      </View>
    )}
    <View
      flexDirection="row"
      alignItems="center"
      borderLeftColor="border.2"
      borderLeftStyle="solid"
      borderLeftWidth={1}
      py="tiny"
      px="small"
    >
      <Text variant="uiTextSmall" color="text.2" mr="tiny">
        Published with
      </Text>
      <Button
        variant="uiLink"
        textColor="text.2"
        textVariant="uiTextSmall"
        color="text.2"
        href="https://databyss.org"
        target="_blank"
      >
        Databyss
      </Button>
      <Text variant="uiTextSmall" color="text.2" ml="tiny">
        (v{version})
      </Text>
    </View>
  </View>
)
