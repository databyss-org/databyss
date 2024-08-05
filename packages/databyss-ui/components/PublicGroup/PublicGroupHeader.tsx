import React, { useCallback } from 'react'
import DatabyssImg from '@databyss-org/ui/assets/logo-thick.png'
import MoonSvg from '@databyss-org/ui/assets/moon.svg'
import MoonFilledSvg from '@databyss-org/ui/assets/moon-filled.svg'
import { Group } from '@databyss-org/services/interfaces'
import { Text, View, Icon, BaseControl } from '../..'
import { pxUnits } from '../../theming/views'
import { darkTheme } from '../../theming/theme'
import { PublicGroupMenu } from './PublicGroupMenu'

export const PublicGroupHeader = ({
  group,
  darkMode,
  setDarkMode,
}: {
  group: Group
  darkMode: boolean
  setDarkMode: (value) => void
}) => {
  const toggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode)
  }, [setDarkMode, darkMode])
  return (
    <View
      flexDirection="row"
      bg="background.1"
      theme={darkTheme}
      p="small"
      borderBottomColor="border.2"
      borderBottomWidth={pxUnits(1)}
      borderBottomStyle="solid"
      alignItems="center"
      justifyContent="space-between"
      pr="em"
    >
      <View flexDirection="row" alignItems="center" py="tiny" pl="small">
        <img src={DatabyssImg} width={pxUnits(48)} />
        <View ml="em">
          <Text variant="bodyHeading1" color="text.2">
            {group.name}
          </Text>
          {group.subtitle?.textValue?.length && (
            <Text variant="uiTextSmall" color="text.2">
              {group.subtitle.textValue}
            </Text>
          )}
        </View>
      </View>
      <View flexDirection="row" alignItems="center">
        <BaseControl
          onPress={toggleDarkMode}
          hoverColor="background.2"
          p="tiny"
          borderRadius="default"
          mr="small"
        >
          <Icon sizeVariant="small">
            {darkMode ? <MoonFilledSvg /> : <MoonSvg />}
          </Icon>
        </BaseControl>
        <PublicGroupMenu />
      </View>
    </View>
  )
}
