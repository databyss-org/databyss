import React, { useCallback } from 'react'
import DatabyssImg from '@databyss-org/ui/assets/logo-thick.png'
// import MoonSvg from '@databyss-org/ui/assets/moon.svg'
// import MoonFilledSvg from '@databyss-org/ui/assets/moon-filled.svg'
import SunSvg from '@databyss-org/ui/assets/sun.svg'
import ShareSvg from '@databyss-org/ui/assets/share.svg'
import { Group } from '@databyss-org/services/interfaces'
import { Text, View, Icon, BaseControl } from '../..'
import { pxUnits } from '../../theming/views'
import { darkTheme } from '../../theming/theme'
// import { PublicGroupMenu } from './PublicGroupMenu'
import { useNavigationContext } from '../Navigation'

export const PublicGroupHeader = ({
  group,
  darkMode,
  setDarkMode,
  ...others
}: {
  group: Group
  darkMode: boolean
  setDarkMode: (value) => void
}) => {
  const showModal = useNavigationContext((c) => c && c.showModal)

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode)
  }, [setDarkMode, darkMode])

  const showExportModal = useCallback(() => {
    showModal({
      component: 'EXPORTDB',
      visible: true,
    })
  }, [showModal])

  return (
    <View
      flexDirection="row"
      bg="background.0"
      theme={darkTheme}
      p="small"
      borderBottomColor="border.2"
      borderBottomWidth={pxUnits(1)}
      borderBottomStyle="solid"
      alignItems="center"
      justifyContent="space-between"
      pr="em"
      {...others}
    >
      <View flexDirection="row" alignItems="center" py="tiny" pl="small">
        <img src={DatabyssImg} width={pxUnits(48)} />
        <View ml="em">
          <Text variant="bodyHeading1" color="text.2">
            {group.name}
          </Text>
          {!!group.subtitle?.textValue?.length && (
            <Text variant="uiTextSmall" color="text.2">
              {group.subtitle.textValue}
            </Text>
          )}
        </View>
      </View>
      <View flexDirection="row" alignItems="center">
        <BaseControl
          onPress={showExportModal}
          hoverColor="background.2"
          p="tiny"
          borderRadius="default"
          mr="em"
        >
          <Icon sizeVariant="small" color="text.2">
            <ShareSvg />
          </Icon>
        </BaseControl>
        <BaseControl
          onPress={toggleDarkMode}
          hoverColor="background.2"
          p="tiny"
          borderRadius="default"
          mr="small"
        >
          <Icon sizeVariant="small" color="text.2">
            <SunSvg />
          </Icon>
        </BaseControl>
        {/* <PublicGroupMenu /> */}
      </View>
    </View>
  )
}
