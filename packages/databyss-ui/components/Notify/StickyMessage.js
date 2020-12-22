import React, { useState } from 'react'
import { ThemeProvider } from 'emotion-theming'
import { darkTheme } from '@databyss-org/ui/theming/theme'
import {
  View,
  Grid,
  RawHtml,
  Icon,
  BaseControl,
} from '@databyss-org/ui/primitives'
import CloseSvg from '@databyss-org/ui/assets/close.svg'

const StickyMessage = ({ messageId, html }) => {
  const [dismissed, setDismissed] = useState(
    localStorage.getItem(`${messageId}_dismissed`)
  )
  const dismiss = () => {
    localStorage.setItem(`${messageId}_dismissed`, '1')
    setDismissed('1')
  }
  if (dismissed) {
    return null
  }
  return (
    <ThemeProvider theme={darkTheme}>
      <View
        bg="background.0"
        width="100%"
        alignItems="center"
        pt="small"
        pb="em"
      >
        <Grid
          widthVariant="content"
          singleRow
          columnGap="small"
          flexWrap="nowrap"
        >
          <View width="100%" pr="medium">
            <RawHtml html={html} color="text.0" variant="uiTextNormal" />
          </View>
          <BaseControl
            onPress={dismiss}
            py="tiny"
            px="tiny"
            alignSelf="flex-start"
          >
            <Icon sizeVariant="tiny" color="text.3">
              <CloseSvg />
            </Icon>
          </BaseControl>
        </Grid>
      </View>
    </ThemeProvider>
  )
}

export default StickyMessage
